import P from "./Point";
import Vertex from "./Vertex";
import VertexCreator from "./VertexCreator";
import Edge from "./Edge";
import { vertexRadius, borderWidth } from "./config";
import { getClosestVertex } from "./helpers";
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
  touchedPart?: vertexPart;
}

function getTouchInfo(
  vertices: Vertex[],
  touchPoint: P,
  excludeVertex?: Vertex
): TouchInfo {
  const vertex = getClosestVertex(vertices, touchPoint, excludeVertex);

  if (vertex) {
    const distance = vertex.position.getDistance(touchPoint);
    const isInsideBorder = distance < borderRadius;

    if (isInsideBorder) {
      const isInsideBody = distance < bodyRadius;
      const touchedPart = isInsideBody ? vertexPart.body : vertexPart.border;
      return { vertex, touchedPart };
    }
  }
  return { vertex: null };
}

// universal stuff for creating new vertex
function newVertexUniversals(
  vertices: Vertex[],
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
  vertices: Vertex[],
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
  vertices: Vertex[],
  touchPoint: P,
  click: Click,
  vertexCreator: VertexCreator
) {
  const { position } = vertexCreator;
  const newVertex = newVertexUniversals(vertices, position, vertexCreator);

  click.item = newVertex;
  click.offset = newVertex.position.vecTo(touchPoint);
}

function handlers(
  canvas: HTMLCanvasElement,
  vertices: Vertex[],
  edges: Edge[],
  vertexCreator: VertexCreator
) {
  function touchStart(event: TouchEvent) {
    event.preventDefault();

    const { changedTouches } = event;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];

      const touchPoint = getTouchPos(canvas, touch);
      const touchInfo = getTouchInfo(vertices, touchPoint);
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
              const edgeIndex = edges.indexOf(item);
              /**
             * @TODO
             * - Don't like mutating array here either :/
             */
              edges.splice(edgeIndex, 1);
            }
          }
        }
      }
      delete touches[touch.identifier];
    }
  }

  function mouseStart(event: MouseEvent) {
    event.preventDefault();
    console.log("click started");
    const touchPoint = getTouchPos(canvas, event);
    const touchInfo = getTouchInfo(vertices, touchPoint);
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
            // delete edge
            const edgeIndex = edges.indexOf(item);
            /**
             * @TODO
             * - Don't like mutating array here either :/
             */
            edges.splice(edgeIndex, 1);
          }
        }
      }
    }
    click.item = null;
  }

  return { touchStart, touchMove, touchEnd, mouseStart, mouseMove, mouseEnd };
}

function getTouchPos(canvas: HTMLCanvasElement, touch: Touch | MouseEvent) {
  var rect = canvas.getBoundingClientRect();

  return new P(touch.clientX - rect.left, touch.clientY - rect.top);
}

export default handlers;
