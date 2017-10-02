import P from "./Point";
import Vertex from "./Vertex";
import VertexCollection from "./VertexCollection";
import VertexCreator from "./VertexCreator";
import Edge from "./Edge";
import EdgeCollection from "./EdgeCollection";
import { vertexRadius, borderWidth, edgeWidth } from "./config";
import { getClosestVertex, distanceFromEdge, getClosestEdge } from "./helpers";
import find from "lodash/find";

const bodyRadius = vertexRadius - borderWidth / 2;
const borderRadius = vertexRadius + borderWidth / 2;

interface TouchHolder {
  [key: number]: Vertex | Edge;
}

interface Click {
  item: Vertex | Edge | null;
  offset: P;
}

const touches: TouchHolder = {};

let click: Click = {
  item: null,
  offset: new P()
};

enum vertexPart {
  body,
  border
}

interface TouchInfo {
  vertex: Vertex | null;
  edge: Edge | null;
  touchedPart?: vertexPart;
}

function getTouchInfo(
  vertices: VertexCollection,
  edges: EdgeCollection,
  touchPoint: P,
  excludeVertex?: Vertex
): TouchInfo {
  const vertex = getClosestVertex(vertices, touchPoint, excludeVertex);

  const edge = getClosestEdge(edges, touchPoint);

  if (vertex) {
    const distance = vertex.position.getDistance(touchPoint);
    const isInsideBorder = distance < borderRadius;

    if (isInsideBorder) {
      const isInsideBody = distance < bodyRadius;
      const touchedPart = isInsideBody ? vertexPart.body : vertexPart.border;
      return { vertex, edge: null, touchedPart };
    } else if (edge) {
      const distance = distanceFromEdge(touchPoint, edge);
      const isOnEdge = distance < edgeWidth;
      if (isOnEdge) {
        return { vertex: null, edge };
      }
    }
  }

  return { vertex: null, edge: null };
}

// universal stuff for creating new vertex
function newVertexUniversals(
  vertices: VertexCollection,
  startCenter: P,
  vertexCreator: VertexCreator
) {
  const newVertex = new Vertex(startCenter);
  newVertex.newlyCreatedBy = vertexCreator;
  newVertex.dragging = true;
  vertices.push(newVertex);
  return newVertex;
}

// specific to creating new vertex by touch
function newVertexTouch(
  vertices: VertexCollection,
  touchPoint: P,
  touches: TouchHolder,
  touch: Touch,
  vertexCreator: VertexCreator
) {
  const newVertex = newVertexUniversals(vertices, touchPoint, vertexCreator);

  newVertex.drag(touchPoint); // snap to finger
  touches[touch.identifier] = newVertex;
}

// specific to creating new vertex by mouse
function newVertexMouse(
  vertices: VertexCollection,
  touchPoint: P,
  click: Click,
  vertexCreator: VertexCreator
) {
  const { position } = vertexCreator;
  const newVertex = newVertexUniversals(vertices, position, vertexCreator);

  click.item = newVertex;
  click.offset = newVertex.position.vecTo(touchPoint);
}

function deleteVertex(
  vertex: Vertex,
  vertices: VertexCollection,
  edges: EdgeCollection
) {
  const matchingEdges = edges.toArray().filter(edge => {
    const isOnVertex = edge.vertices.a === vertex || edge.vertices.b === vertex;
    return isOnVertex;
  });

  matchingEdges.forEach(edge => edges.delete(edge));

  vertices.delete(vertex);
}

function deleteEdge(edge: Edge, edges: EdgeCollection) {
  edges.delete(edge);
}

function handlersFactory(
  canvas: HTMLCanvasElement,
  vertices: VertexCollection,
  edges: EdgeCollection,
  vertexCreator: VertexCreator
) {
  function touchStart(event: TouchEvent) {
    event.preventDefault();

    const { changedTouches } = event;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];

      const touchPoint = getTouchPos(canvas, touch);
      const touchInfo = getTouchInfo(vertices, edges, touchPoint);
      const { vertex, touchedPart } = touchInfo;

      const touchedVertexCreator =
        vertexCreator.position.getDistance(touchPoint) < borderRadius;

      if (vertex) {
        if (touchedPart === vertexPart.body) {
          vertex.dragging = true;
          vertex.drag(touchPoint); // snap to finger
          touches[touch.identifier] = vertex;
        } else {
          const edge = new Edge(vertex, touchPoint);
          /**
             * @TODO
             * - Don't like mutating the array in an obscure method
             */
          edges.push(edge);
          touches[touch.identifier] = edge;
        }
      } else if (touchedVertexCreator) {
        newVertexTouch(vertices, touchPoint, touches, touch, vertexCreator);
      }
    }
  }

  function touchMove(event: TouchEvent) {
    event.preventDefault();

    const { changedTouches } = event;
    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      const position = getTouchPos(canvas, touch);
      const item = touches[touch.identifier];
      if (item) {
        if (item instanceof Vertex) {
          item.drag(position);
        } else {
          item.setPointB(position);
        }
      }
    }
  }

  function touchEnd(event: TouchEvent) {
    event.preventDefault();

    const { changedTouches } = event;
    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      const touchPoint = getTouchPos(canvas, touch);

      const item = touches[touch.identifier];
      if (item) {
        if (item instanceof Vertex) {
          item.dragging = false;
          delete touches[touch.identifier];

          const isOnCreator =
            item.position.getDistance(vertexCreator.position) <
            borderRadius * 2;
          if (isOnCreator) {
            deleteVertex(item, vertices, edges);
          }
        } else {
          const closestVertex = getClosestVertex(
            vertices,
            touchPoint,
            item.vertices.a
          );
          if (closestVertex) {
            const isOnVertex = closestVertex.position.isWithinRadius(
              touchPoint,
              borderRadius
            );

            if (isOnVertex) {
              item.attachToVertex(closestVertex);
            } else {
              /**
             * @TODO
             * - Don't like mutating array here either :/
             */
              edges.delete(item);
            }
          }
        }
      }
      delete touches[touch.identifier];
    }
  }

  function mouseStart(event: MouseEvent) {
    event.preventDefault();
    const touchPoint = getTouchPos(canvas, event);
    const touchInfo = getTouchInfo(vertices, edges, touchPoint);
    const { vertex, touchedPart } = touchInfo;

    const touchedVertexCreator =
      vertexCreator.position.getDistance(touchPoint) < borderRadius;

    if (vertex) {
      if (touchedPart === vertexPart.body) {
        click.item = vertex;
        click.offset = vertex.position.vecTo(touchPoint);
        vertex.dragging = true;
      } else {
        const edge = new Edge(vertex, touchPoint);
        /**
       * @TODO
       * - Don't like mutating the array in an obscure method
       */
        edges.push(edge);
        click.item = edge;
      }
    } else if (touchedVertexCreator) {
      newVertexMouse(vertices, touchPoint, click, vertexCreator);
    }
  }

  function mouseMove(event: MouseEvent) {
    const { item, offset } = click;
    if (item) {
      event.preventDefault();

      const pos = getTouchPos(canvas, event);
      if (item instanceof Vertex) {
        item.drag(pos.subtract(offset));
      } else {
        item.setPointB(pos);
      }
    }
  }

  function mouseEnd(event: MouseEvent) {
    event.preventDefault();

    const { item } = click;
    if (item) {
      if (item instanceof Vertex) {
        item.dragging = false;
        click.item = null;

        const isOnCreator =
          item.position.getDistance(vertexCreator.position) < borderRadius * 2;
        if (isOnCreator) {
          deleteVertex(item, vertices, edges);
        }
      } else {
        const position = getTouchPos(canvas, event);

        const closestVertex = getClosestVertex(
          vertices,
          position,
          item.vertices.a
        );
        if (closestVertex) {
          const isOnVertex = closestVertex.position.isWithinRadius(
            position,
            borderRadius
          );

          if (isOnVertex) {
            item.attachToVertex(closestVertex);
          } else {
            /**
             * @TODO
             * - Don't like mutating array here either :/
             */
            edges.delete(item);
          }
        }
      }
    }
    click.item = null;
  }

  function doubleClick(event: MouseEvent) {
    const touchPoint = getTouchPos(canvas, event);
    const touchInfo = getTouchInfo(vertices, edges, touchPoint);
    const { vertex, edge, touchedPart } = touchInfo;
    if (vertex && touchedPart === vertexPart.body) {
      deleteVertex(vertex, vertices, edges);
    } else if (edge) {
      deleteEdge(edge, edges);
    }
  }

  return {
    touchStart,
    touchMove,
    touchEnd,
    mouseStart,
    mouseMove,
    mouseEnd,
    doubleClick
  };
}

function getTouchPos(canvas: HTMLCanvasElement, touch: Touch | MouseEvent) {
  var rect = canvas.getBoundingClientRect();

  return new P(touch.clientX - rect.left, touch.clientY - rect.top);
}

export default handlersFactory;
