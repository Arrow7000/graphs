import P from './Point';
import Vertex from './Vertex';
import { vertexRadius } from './config';


const touches: TouchHolder = {};

interface TouchHolder {
    [key: number]: Vertex;
}

function handlers(canvas: HTMLCanvasElement, nodes: Vertex[]) {

    function handleStart(event: TouchEvent) {
        event.preventDefault();

        const touch = event.touches[0];
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


    function handleMove(event: TouchEvent) {
        const touch = event.changedTouches[0];
        const position = getTouchPos(canvas, touch);
        const vertex = touches[touch.identifier];
        if (vertex) {
            vertex.drag(position);
        }
    }


    function handleEnd(event: TouchEvent) {
        const touch = event.changedTouches[0];
        const vertex = touches[touch.identifier];
        if (vertex) {
            vertex.dragging = false;
        }
        delete touches[touch.identifier];
    }

    return { handleStart, handleMove, handleEnd };
}

function getTouchPos(canvas: HTMLCanvasElement, touch: Touch) {
    var rect = canvas.getBoundingClientRect();

    return new P(
        touch.clientX - rect.left,
        touch.clientY - rect.top
    );
}



export default handlers;