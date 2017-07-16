import P from './Point';
import Vertex from './Vertex';
import { vertexRadius } from './config';


interface TouchHolder {
    [key: number]: Vertex;
}


const touches: TouchHolder = {};
let click: Vertex = null;

function handlers(canvas: HTMLCanvasElement, nodes: Vertex[]) {

    function touchStart(event: TouchEvent) {
        event.preventDefault();

        const touchList = event.changedTouches;

        for (let i = 0; i < touchList.length; i++) {
            const touch = touchList[i];

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

        const touch = event.changedTouches[0];
        const position = getTouchPos(canvas, touch);
        const vertex = touches[touch.identifier];
        if (vertex) {
            vertex.drag(position);
        }
    }


    function touchEnd(event: TouchEvent) {
        event.preventDefault();

        const touch = event.changedTouches[0];
        const vertex = touches[touch.identifier];
        if (vertex) {
            vertex.dragging = false;
        }
        delete touches[touch.identifier];
    }


    function mouseStart(event: MouseEvent) {
        event.preventDefault();

        const position = getTouchPos(canvas, event);

        const { x, y } = position

        const clickedVertex = nodes.reduce((last, vertex) => {
            if (vertex.position.getDistance(new P(x, y)) < vertexRadius) {
                return vertex;
            }
            return last;
        }, null);

        if (clickedVertex) {
            click = clickedVertex;
            clickedVertex.dragging = true;
        }

    }

    function mouseMove(event: MouseEvent) {
        const vertex = click;
        if (vertex) {
            event.preventDefault();

            const position = getTouchPos(canvas, event);

            const x = event.movementX;
            const y = event.movementY;

            vertex.drag(position);
        }
    }

    function mouseEnd(event: MouseEvent) {
        event.preventDefault();

        const vertex = click;
        if (vertex) {
            vertex.dragging = false;
        }
        click = null;
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