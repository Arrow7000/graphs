import { springLength, springConstant } from './config';
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
        const distance = getDistance(a.position.x, a.position.y, b.position.x, b.position.y)
        return distance;
    }

    update() {
        const { a, b } = this.vertices;
        const distance = this.getDistance();

        // if (distance > restDistance) {
        // Hooke's law: F = -k(x - x0)
        const forceVectorLength = -springConstant * (springLength - distance);
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
        // console.log(`edge going from ${JSON.stringify(a.position)} to ${JSON.stringify(b.position)}`);
    }
}

export default Edge;
