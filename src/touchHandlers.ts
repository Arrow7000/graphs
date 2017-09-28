import P from "./Point";
import Vertex from "./Vertex";
import Edge from "./Edge";
import { vertexRadius, lineWidth } from "./config";
import find from "lodash/find";

interface TouchHolder {
  [key: number]: Vertex | Edge;
}

interface Click {
  vertex: Vertex | null;
  offset: P;
}

const touches: TouchHolder = {};

let click: Click = {
  vertex: null,
  offset: new P()
};

function handlers(canvas: HTMLCanvasElement, nodes: Vertex[], edges: Edge[]) {
  const bodyRadius = vertexRadius - lineWidth / 2;
  const lineRadius = vertexRadius + lineWidth / 2;

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

      const touchedVertexObj = nodes.reduce((last, vertex) => {
        const isInBody = vertex.position.getDistance(touchPoint) < bodyRadius;
        const isInBorder = vertex.position.getDistance(touchPoint) < lineRadius;

        if (isInBorder) {
          if (isInBody) {
            return { vertex, touchedItem: itemTouched.body };
          } else {
            return { vertex, touchedItem: itemTouched.radius };
          }
        }
        return last;
      }, null);

      if (touchedVertexObj) {
        const { vertex, touchedItem } = touchedVertexObj;
        if (touchedItem === itemTouched.body) {
          vertex.dragging = true;
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
          item.vertices.b = position;
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
          // either attach to vertex or delete
          const droppedVertex = nodes.reduce((last, vertex) => {
            const isInsideBorder =
              vertex.position.getDistance(touchPoint) < lineRadius;

            if (isInsideBorder && vertex !== item.vertices.a) {
              return vertex;
            }
            return last;
          }, null);

          if (droppedVertex) {
            item.vertices.b = droppedVertex;
          } else {
            const edgeIndex = edges.indexOf(item);
            edges.splice(edgeIndex, 1);
          }
        }
      }
      delete touches[touch.identifier];
    }
  }

  function mouseStart(event: MouseEvent) {
    event.preventDefault();

    const position = getTouchPos(canvas, event);

    const { x, y } = position;

    const vertex = nodes.reduce((last, vertex) => {
      if (vertex.position.isWithinRadius(new P(x, y), vertexRadius)) {
        return vertex;
      }
      return last;
    }, null);

    if (vertex) {
      click.vertex = vertex;
      click.offset = vertex.position.vecTo(position);
      vertex.dragging = true;
    }
  }

  function mouseMove(event: MouseEvent) {
    const { vertex, offset } = click;
    if (vertex) {
      event.preventDefault();

      const pos = getTouchPos(canvas, event);
      vertex.drag(pos.subtract(offset));
    }
  }

  function mouseEnd(event: MouseEvent) {
    event.preventDefault();

    const { vertex } = click;
    if (vertex) {
      vertex.dragging = false;
    }
    click.vertex = null;
  }

  return { touchStart, touchMove, touchEnd, mouseStart, mouseMove, mouseEnd };
}

function getTouchPos(canvas: HTMLCanvasElement, touch: Touch | MouseEvent) {
  var rect = canvas.getBoundingClientRect();

  return new P(touch.clientX - rect.left, touch.clientY - rect.top);
}

export default handlers;
