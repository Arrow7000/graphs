import { springLength, stiffness } from './config';
import { getDistance, subtrVec, multiplyVec, divideVec } from './utils';


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

    update() {
        const { a, b } = this.vertices;
        const distance = this.getDistance();

        // if (distance > restDistance) {
        // Hooke's law: F = -k(x - x0)
        const forceVectorLength = -stiffness * (springLength - distance);
        const eachForce = forceVectorLength / 2;

        {
            const vecAtoB = subtrVec(b.position, a.position);
            const directionFromAtoB = divideVec(vecAtoB, distance);
            const forceAtoB = multiplyVec(directionFromAtoB, eachForce);
            a.applyForce(forceAtoB);
        }

        {
            const vecBtoA = subtrVec(a.position, b.position);
            const directionFromBtoA = divideVec(vecBtoA, distance);
            const forceBtoA = multiplyVec(directionFromBtoA, eachForce);
            b.applyForce(forceBtoA);
        }


        // } else {
        //     /**
        //      * @TODO
        //      * - implement repulsive force (reverse Hooke's law?)
        //      */
        // }
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
