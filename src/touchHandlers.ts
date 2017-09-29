import P from "./Point";
import Vertex from "./Vertex";
import Edge from "./Edge";
import { vertexRadius, lineWidth } from "./config";
import find from "lodash/find";

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

function getClosestVertex(
  vertices: Vertex[],
  point: P,
  excludeVertex?: Vertex
): Vertex | null {
  let closestDistance = Infinity;
  const closestVertex = vertices.reduce((last, vertex) => {
    if (vertex === excludeVertex) return last;

    const distance = vertex.position.getDistance(point);
    if (distance < closestDistance) {
      closestDistance = distance;
      return vertex;
    } else {
      return last;
    }
  }, null);
  return closestVertex;
}

function handlers(canvas: HTMLCanvasElement, nodes: Vertex[], edges: Edge[]) {
  const bodyRadius = vertexRadius - lineWidth / 2;
  const borderRadius = vertexRadius + lineWidth / 2;

  enum itemTouched {
    body,
    radius
  }

  function touchStart(event: TouchEvent) {
    event.preventDefault();

    const { changedTouches } = event;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];

      const touchPoint = getTouchPos(canvas, touch);

      const closestVertex = getClosestVertex(nodes, touchPoint);
      if (closestVertex) {
        const distance = closestVertex.position.getDistance(touchPoint);
        const isInsideBorder = distance < borderRadius;
        const isInsideBody = distance < bodyRadius;

        if (isInsideBorder) {
          if (isInsideBody) {
            closestVertex.dragging = true;
            touches[touch.identifier] = closestVertex;
          } else {
            const edge = new Edge(closestVertex, touchPoint);
            /**
               * @TODO
               * - Don't like mutating the array in an obscure method
               */
            edges.push(edge);
            touches[touch.identifier] = edge;
          }
        }
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
        } else {

          const closestVertex = getClosestVertex(
            nodes,
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

    const position = getTouchPos(canvas, event);

    const closestVertex = getClosestVertex(nodes, position);
    if (closestVertex) {
      const distance = closestVertex.position.getDistance(position);
      const isInsideBorder = distance < borderRadius;
      const isInsideBody = distance < bodyRadius;

      if (isInsideBorder) {
        if (isInsideBody) {
          click.item = closestVertex;
          click.offset = closestVertex.position.vecTo(position);
          closestVertex.dragging = true;
        } else {
          const edge = new Edge(closestVertex, position);
          /**
         * @TODO
         * - Don't like mutating the array in an obscure method
         */
          edges.push(edge);
          click.item = edge;
        }
      }
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
          nodes,
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
