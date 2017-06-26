import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Vertex from './Vertex';
import P, { sqr, getVectorLen, getDistance, normaliseVec, vecFromTo, multiplyVec, getAvgPosition, setVecToLen, combineVectors } from './Point';
import Edge from './Edge';
// import { sqr, getVectorLen, getDistance, normaliseVec, vecFromTo, multiplyVec, getAvgPosition, setVecToLen, combineVectors } from './vectorMaths';
import { springLength, stiffness, vertexMass, coulombConst, vertexCharge, cappedElectro, electroCapStrengthDistance, theta, centerForce, G, minDistance } from './config';
import {
    constructQuadTree, directions, QuadUnit, QuadParentUnit, QuadSubUnit, isQuadParent
} from './utils';


function coulombStrength(coulombConst: number, vertexCharge: number, distance: number): number {
    // console.log({ coulombConst, vertexCharge, distance });
    const strength = coulombConst * (vertexCharge * vertexCharge) / sqr(distance / 2);
    // console.log({ strength });
    return strength;
}

function getCoulombForce(node: Vertex, position: P, charge: number) {
    // debugger;
    const vecToTarget = node.position.vecTo(position);
    // const distance = cap(vecToTarget.getLength(), minDistance, true);
    const distance = vecToTarget.getLength();
    // console.log(distance);

    if (distance < 0 || distance === Infinity) { debugger; }

    const strength = coulombStrength(coulombConst, charge, distance);
    // console.log({ strength });
    const force = vecToTarget.toLen(strength);

    return force;
}

export function applyElectrostatic(nodes: Vertex[], end: P) {
    // console.log('START RUN');

    each(nodes, node => {
        const tree = constructQuadTree(node, nodes, new P(0, 0), end);
        // console.log('TREE CONSTRUCTED');
        const totalForce = traverser(node, tree);

        node.applyForce(totalForce);
    });
}

function traverser(node: Vertex, tree: QuadUnit): P {
    // debugger;
    if (isQuadParent(tree)) {
        // const distance = cap(getVectorLen(vecFromTo(node.position, tree.centerOfCharge)), minDistance, true);
        const distance = getVectorLen(vecFromTo(node.position, tree.centerOfCharge));
        // console.log({ distance });
        const sByD = tree.width / distance;
        if (sByD < theta) { // use Barnes-Hut approximation
            console.log('use barnes-hut');
            const { centerOfCharge, totalCharge } = tree;
            const force = getCoulombForce(node, centerOfCharge, totalCharge);
            if (isNaN(force.x)) { debugger; }
            return force
        } else { // we need to go deeper
            console.log('go deeper');

            const subtrees = filter(tree, (value, key) => directions.includes(key));

            const vectors = map(subtrees, subtree => traverser(node, subtree));

            const combinedVectors = combineVectors(vectors);
            if (isNaN(combinedVectors.x)) { debugger; }
            return combinedVectors;
        }
    } else { // base case
        console.log('base case');
        const { position, charge } = tree.vertex;
        const force = getCoulombForce(node, position, charge);
        if (isNaN(force.x)) { debugger; }
        return force
    }
}


export function applyGravity(nodes: Vertex[], center: P) {
    each(nodes, node => {
        const vecToCenter = vecFromTo(node.position, center);
        const distance = getVectorLen(vecToCenter);
        const direction = normaliseVec(vecToCenter);
        const force = G * sqr(vertexMass) / sqr(distance);
        const vector = multiplyVec(direction, force);
        node.applyForce(vector);
    });
}


// Hooke's law: F = -k(x - x0)
function springForce(stiffness: number, springLength: number, distance: number): number {
    return -stiffness * (springLength - distance);
}

export function applySpring(edges: Edge[]) {
    each(edges, edge => {
        const { a, b } = edge.vertices;
        const distance = edge.getDistance();

        const forceVectorLength = springForce(stiffness, springLength, distance);
        const eachForce = forceVectorLength / 2;


        const vecAtoB = vecFromTo(a.position, b.position);
        const directionFromAtoB = normaliseVec(vecAtoB);
        const forceAtoB = multiplyVec(directionFromAtoB, eachForce);
        a.applyForce(forceAtoB);

        const forceBtoA = multiplyVec(forceAtoB, -1);
        b.applyForce(forceBtoA);

    });
}


// false force, operates directly on position, not velocity
export function applyCenterMovement(nodes: Vertex[], center: P) {
    const avgPosition = getAvgPosition(nodes.map(node => node.position));
    const toCenter = vecFromTo(avgPosition, center);

    each(nodes, node => {
        const vector = multiplyVec(toCenter, centerForce);
        node.applyMovement(vector);
    });
}


function cap(num: number, limit: number, capMinimum: boolean): number {
    if (capMinimum) {
        return num < limit ? limit : num;
    }
    return num > limit ? limit : num;
}
