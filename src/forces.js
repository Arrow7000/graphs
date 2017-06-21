import each from 'lodash/each';
import { sqr, getVectorLen, getDistance, normaliseVec, vecFromTo, multiplyVec, getAvgPosition } from './vectorMaths';
import { springLength, stiffness, vertexMass, coulombConst, vertexCharge, centerForce, G } from './config';




export function applyCoulomb(nodes) {
    // Coulomb force
    each(nodes, thisNode => {
        each(nodes, otherNode => {
            if (thisNode.id !== otherNode.id) {
                const distance = getDistance(thisNode.position, otherNode.position);

                const force = coulombConst * (vertexCharge * vertexCharge) / sqr(distance / 2);

                const vecToNode = vecFromTo(otherNode.position, thisNode.position);
                const normalisedDirection = normaliseVec(vecToNode);
                const vector = multiplyVec(normalisedDirection, force);

                thisNode.applyForce(vector);
            }
        });
    });
}


export function applyGravity(nodes, center) {
    // Gravity towards center of canvas
    each(nodes, node => {
        const vecToCenter = vecFromTo(node.position, center);
        const distance = getVectorLen(vecToCenter);
        const direction = normaliseVec(vecToCenter);
        const force = G * sqr(vertexMass) / sqr(distance);
        const vector = multiplyVec(direction, force);
        node.applyForce(vector);
    });
}


export function applySpring(edges) {
    each(edges, edge => {
        const { a, b } = edge.vertices;
        const distance = edge.getDistance();

        // if (distance > restDistance) {
        // Hooke's law: F = -k(x - x0)
        const forceVectorLength = -stiffness * (springLength - distance);
        const eachForce = forceVectorLength / 2;

        {
            const vecAtoB = vecFromTo(a.position, b.position);
            const directionFromAtoB = normaliseVec(vecAtoB);
            const forceAtoB = multiplyVec(directionFromAtoB, eachForce);
            a.applyForce(forceAtoB);
        }

        {
            const vecBtoA = vecFromTo(b.position, a.position);
            const directionFromBtoA = normaliseVec(vecBtoA);
            const forceBtoA = multiplyVec(directionFromBtoA, eachForce);
            b.applyForce(forceBtoA);
        }
    });
}


// false force, operates directly on position, not velocity
export function applyCenterMovement(nodes, center) {
    const avgPosition = getAvgPosition(nodes.map(node => node.position));
    const toCenter = vecFromTo(avgPosition, center);

    each(nodes, node => {
        const vector = multiplyVec(toCenter, centerForce);
        node.applyMovement(vector);
    });
}
