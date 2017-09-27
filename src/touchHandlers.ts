import P from './Point';
import Vertex from './Vertex';
import { vertexRadius } from './config';


interface TouchHolder {
    [key: number]: Vertex;
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

function handlers(canvas: HTMLCanvasElement, nodes: Vertex[]) {

    function touchStart(event: TouchEvent) {
        event.preventDefault();

        const { changedTouches } = event;

        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];

            const touchPoint = getTouchPos(canvas, touch);

            const touchedVertex = nodes.reduce((last, vertex) => {
                if (vertex.position.getDistance(touchPoint) < vertexRadius) {
                    return vertex;
                }
                return last;
            }, null);

            if (touchedVertex) {
                touches[touch.identifier] = touchedVertex;
                touches[touch.identifier].dragging = true;
            }
        }
    }


    function touchMove(event: TouchEvent) {
        event.preventDefault();

        const { changedTouches } = event;
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];

            const position = getTouchPos(canvas, touch);
            const vertex = touches[touch.identifier];
            if (vertex) {
                vertex.drag(position);
            }
        }
    }


    function touchEnd(event: TouchEvent) {
        event.preventDefault();

        const { changedTouches } = event;
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];

            const vertex = touches[touch.identifier];
            if (vertex) {
                vertex.dragging = false;
            }
            delete touches[touch.identifier];
        }
    }


    function mouseStart(event: MouseEvent) {
        event.preventDefault();

        const position = getTouchPos(canvas, event);

        const { x, y } = position

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

    return new P(
        touch.clientX - rect.left,
        touch.clientY - rect.top
    );
}



export default handlers;