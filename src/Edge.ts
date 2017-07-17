import Vertex from './Vertex';
import { getDistance } from './Point';
import { edgeColour } from "./config";

// const arrowHeadLen = 5;


class Edge {

    directed: boolean;
    vertices: {
        a: Vertex,
        b: Vertex
    }

    constructor(vertexA: Vertex, vertexB: Vertex, directed: boolean = false) {
        this.vertices = {
            a: vertexA,
            b: vertexB,
        };
        this.directed = directed;
    }

    getDistance() {
        const { a, b } = this.vertices;
        const distance = getDistance(a.position, b.position)
        return distance;
    }

    render(ctx: CanvasRenderingContext2D) {
        const { a, b } = this.vertices;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(a.position.x, a.position.y);
        ctx.lineTo(b.position.x, b.position.y);
        ctx.strokeStyle = edgeColour;

        if (this.directed) {

        }

        ctx.stroke();
    }
}

export default Edge;
