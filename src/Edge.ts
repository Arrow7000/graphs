import Vertex from './Vertex';
import P, { getDistance } from './Point';
import { edgeColour, vertexRadius } from "./config";

// const arrowHeadLen = 5;


class Edge {

    directed: boolean;
    vertices: {
        a: Vertex,
        b: Vertex
    }

    constructor(vertexA: Vertex, vertexB: Vertex, directed: boolean = true) {
        this.vertices = {
            a: vertexA,
            b: vertexB,
        };
        this.directed = directed;
    }

    getDistance() {
        const { a, b } = this.vertices;
        const distance = getDistance(a.position, b.position);
        return distance;
    }

    render(ctx: CanvasRenderingContext2D) {
        const { a, b } = this.vertices;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(a.position.x, a.position.y);
        ctx.lineTo(b.position.x, b.position.y);
        ctx.strokeStyle = edgeColour;
        ctx.stroke();




        if (this.directed) {
            const { a, b } = this.vertices;
            const { x, y } = b.position;
            const lineVec = a.position.vecTo(b.position);
            const angle = lineVec.getAngle() + 90;

            const sideLen = 15;
            const center = this.vertices.b.position;

            const triangleTip = center.add(new P(0, vertexRadius).rotate(angle));

            const vertical = new P(0, sideLen);
            const rotationDegrees = 30;
            const toA = vertical.rotate(rotationDegrees);
            const toB = vertical.rotate(-rotationDegrees);

            const triangleA = triangleTip.add(toA).rotate(angle, triangleTip);
            const triangleB = triangleTip.add(toB).rotate(angle, triangleTip);

            ctx.beginPath();
            ctx.moveTo(triangleTip.x, triangleTip.y);

            ctx.lineWidth = 3;
            ctx.fillStyle = edgeColour;
            ctx.lineTo(triangleA.x, triangleA.y);
            ctx.lineTo(triangleB.x, triangleB.y);
            ctx.lineTo(triangleTip.x, triangleTip.y);

            ctx.fill();
        }

    }
}

export default Edge;
