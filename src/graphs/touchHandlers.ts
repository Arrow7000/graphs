import P from "../vectors/Point";
import Vertex from "./Vertex";
import VertexCollection from "./VertexCollection";
import VertexCreator from "./VertexCreator";
import Edge from "./Edge";
import EdgeCollection from "./EdgeCollection";
import Network from "./Network";
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
  network: Network,
  touchPoint: P,
  excludeVertex?: Vertex
): TouchInfo {
  const { vertices, edges } = network;
  const vertex = getClosestVertex(vertices, touchPoint, excludeVertex);

  const edge = getClosestEdge(edges, touchPoint);

  if (vertex) {
    const distanceToVertex = vertex.position.getDistance(touchPoint);
    const isInsideBorder = distanceToVertex < borderRadius;

    if (isInsideBorder) {
      const isInsideBody = distanceToVertex < bodyRadius;
      const touchedPart = isInsideBody ? vertexPart.body : vertexPart.border;

      return { vertex, edge: null, touchedPart };
    } else if (edge) {
      const distanceToEdge = distanceFromEdge(touchPoint, edge);
      const isOnEdge = distanceToEdge < edgeWidth;
      if (isOnEdge) {
        return { vertex: null, edge };
      }
    }
  }

  return { vertex: null, edge: null };
}

// universal stuff for creating new vertex
function newVertexUniversals(
  network: Network,
  startCenter: P,
  vertexCreator: VertexCreator
) {
  const newVertex = new Vertex(startCenter);
  newVertex.newlyCreatedBy = vertexCreator;
  newVertex.dragging = true;
  network.pushVertex(newVertex);
  return newVertex;
}

// specific to creating new vertex by touch
function newVertexTouch(
  network: Network,
  touchPoint: P,
  touches: TouchHolder,
  touch: Touch,
  vertexCreator: VertexCreator
) {
  const newVertex = newVertexUniversals(network, touchPoint, vertexCreator);

  newVertex.move(touchPoint); // snap to finger
  touches[touch.identifier] = newVertex;
}

// specific to creating new vertex by mouse
function newVertexMouse(
  network: Network,
  touchPoint: P,
  click: Click,
  vertexCreator: VertexCreator
) {
  const { position } = vertexCreator;
  const newVertex = newVertexUniversals(network, position, vertexCreator);

  click.item = newVertex;
  click.offset = newVertex.position.vecTo(touchPoint);
}

function deleteVertex(vertex: Vertex, network: Network) {
  const matchingEdges = network.edges.toArray().filter(edge => {
    const isOnVertex = edge.from === vertex || edge.to === vertex;
    return isOnVertex;
  });

  matchingEdges.forEach(edge => network.deleteEdge(edge));

  network.deleteVertex(vertex);
}

function deleteEdge(edge: Edge, network: Network) {
  // edges.delete(edge);
  network.deleteEdge(edge);
}

function handlersFactory(network: Network, vertexCreator: VertexCreator) {
  function touchStart(event: TouchEvent, canvas: HTMLCanvasElement) {
    event.preventDefault();

    const { changedTouches } = event;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];

      const touchPoint = getTouchPos(canvas, touch);
      const touchInfo = getTouchInfo(network, touchPoint);
      const { vertex, touchedPart } = touchInfo;

      const touchedVertexCreator =
        vertexCreator.position.getDistance(touchPoint) < borderRadius;

      if (vertex) {
        if (touchedPart === vertexPart.body) {
          vertex.dragging = true;
          vertex.move(touchPoint); // snap to finger
          touches[touch.identifier] = vertex;
        } else {
          const edge = new Edge(vertex, touchPoint);
          /**
           * @TODO
           * - Don't like mutating the array in an obscure method
           */
          // edges.push(edge);
          network.pushEdge(edge);
          touches[touch.identifier] = edge;
        }
      } else if (touchedVertexCreator) {
        newVertexTouch(network, touchPoint, touches, touch, vertexCreator);
      }
    }
  }

  function touchMove(event: TouchEvent, canvas: HTMLCanvasElement) {
    event.preventDefault();

    const { changedTouches } = event;
    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      const position = getTouchPos(canvas, touch);
      const item = touches[touch.identifier];
      if (item) {
        if (item instanceof Vertex) {
          item.move(position);
        } else {
          item.setPointB(position);
        }
      }
    }
  }

  function touchEnd(event: TouchEvent, canvas: HTMLCanvasElement) {
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
            deleteVertex(item, network);
          }
        } else {
          const closestVertex = getClosestVertex(
            network.vertices,
            touchPoint,
            item.from
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
              // edges.delete(item);
              network.deleteEdge(item);
            }
          }
        }
      }
      delete touches[touch.identifier];
    }
  }

  function mouseStart(event: MouseEvent, canvas: HTMLCanvasElement) {
    event.preventDefault();
    const touchPoint = getTouchPos(canvas, event);
    const touchInfo = getTouchInfo(network, touchPoint);
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
        // edges.push(edge);
        network.pushEdge(edge);
        click.item = edge;
      }
    } else if (touchedVertexCreator) {
      newVertexMouse(network, touchPoint, click, vertexCreator);
    }
  }

  function mouseMove(event: MouseEvent, canvas: HTMLCanvasElement) {
    const { item, offset } = click;
    if (item) {
      event.preventDefault();

      const pos = getTouchPos(canvas, event);
      if (item instanceof Vertex) {
        item.move(pos.subtract(offset));
      } else {
        item.setPointB(pos);
      }
    }
  }

  function mouseEnd(event: MouseEvent, canvas: HTMLCanvasElement) {
    event.preventDefault();

    const { item } = click;
    if (item) {
      if (item instanceof Vertex) {
        item.dragging = false;
        click.item = null;

        const isOnCreator =
          item.position.getDistance(vertexCreator.position) < borderRadius * 2;
        if (isOnCreator) {
          deleteVertex(item, network);
        }
      } else {
        const position = getTouchPos(canvas, event);

        const closestVertex = getClosestVertex(
          network.vertices,
          position,
          item.from
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
            // edges.delete(item);
            network.deleteEdge(item);
          }
        }
      }
    }
    click.item = null;
  }

  function doubleClick(event: MouseEvent, canvas: HTMLCanvasElement) {
    const touchPoint = getTouchPos(canvas, event);
    const touchInfo = getTouchInfo(network, touchPoint);
    const { vertex, edge, touchedPart } = touchInfo;
    if (vertex && touchedPart === vertexPart.body) {
      deleteVertex(vertex, network);
    } else if (edge) {
      deleteEdge(edge, network);
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
  const rect = canvas.getBoundingClientRect();

  return new P(touch.clientX - rect.left, touch.clientY - rect.top);
}

export default handlersFactory;
