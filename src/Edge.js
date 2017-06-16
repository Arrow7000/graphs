import { getDistance } from './utils';


class Edge {
    constructor(vertexA, vertexB) {
        this.vertices = {
            a: vertexA,
            b: vertexB,
        };
    }

    getDistance() {
        const { a, b } = this.vertices;
        const distance = getDistance(a.position, b.position)
        return distance;
    }

    render(ctx) {
        const { a, b } = this.vertices;

        ctx.beginPath();
        ctx.moveTo(a.position.x, a.position.y);
        ctx.lineTo(b.position.x, b.position.y);
        ctx.stroke();
    }
}

export default Edge;
