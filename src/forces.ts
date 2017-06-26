import each from 'lodash/each';
import map from 'lodash/map';
import range from 'lodash/range';
import filter from 'lodash/filter';
import Vertex from './Vertex';
import P, { sqr, getVectorLen, getDistance, normaliseVec, vecFromTo, multiplyVec, getAvgPosition, setVecToLen, combineVectors } from './Point';
import Edge from './Edge';
import { springLength, stiffness, vertexMass, coulombConst, vertexCharge, cappedElectro, electroCapStrengthDistance, theta, centerForce, G, minDistance } from './config';
import {
    constructQuadTree, directions, QuadNode, InternalNode, ExternalNode, isInternalNode, Square
} from './utils';

const { min, max } = Math;

function coulombStrength(coulombConst: number, charge1: number, charge2: number, distance: number): number {
    if (distance < 0.001) { debugger; }
    const strength = coulombConst * (charge1 * charge2) / sqr(distance / 2);
    return strength;
}

function getCoulombForce(vertex: Vertex, position: P, charge1: number, charge2: number): P {
    const vecToTarget = vertex.position.vecTo(position);
    const distance = vecToTarget.getLength();

    if (distance <= 0 || distance === Infinity) { debugger; }

    const strength = coulombStrength(coulombConst, charge1, charge2, distance);
    const force = vecToTarget.toLen(strength);

    return force;
}

export function applyElectrostatic(ctx: CanvasRenderingContext2D, vertices: Vertex[]) {

    const { origin, end } = getLargestSquare(vertices);

    const tree = constructQuadTree(ctx, vertices, origin, end);

    each(vertices, vertex => {
        const totalForce = getTreeForce(vertex, tree);

        vertex.applyForce(totalForce);
    });
}















function getTreeForce(vertex: Vertex, tree: QuadNode, debugCount?: number): P {

    const indent = range(debugCount).map(() => '  ').join();
    // const log = str => console.log(indent + str);
    const log = str => null;



    if (!isInternalNode(tree)) { // if is external
        log('is external node, returning force from vertex');
        const { id, position, charge } = tree.vertex;
        if (id === vertex.id) {
            log('(is self, so no force)');
            return new P(0, 0); // no force if is the same node
        }
        const force = getCoulombForce(vertex, position, vertex.charge, charge);
        if (isNaN(force.x)) { debugger; }
        return force
    } else {
        log('is internal node, so comparing s/d to theta');
        const distance = vertex.position.vecTo(tree.centerOfCharge).getLength();
        const sByD = tree.width / distance;
        // log(sByD);
        if (sByD < theta) {
            log('too far, comparing with tree root');
            const { centerOfCharge, totalCharge } = tree;
            const force = getCoulombForce(vertex, centerOfCharge, vertex.charge, totalCharge);
            if (isNaN(force.x)) { debugger; }
            return force
        } else {
            log('too close: recursing through children');
            const subtrees = filter(tree, (value, key) => directions.includes(key));
            const vectors = map(subtrees, subtree => getTreeForce(vertex, subtree, debugCount ? debugCount + 1 : 1));
            const combinedVectors = combineVectors(vectors);
            if (isNaN(combinedVectors.x)) { debugger; }
            return combinedVectors;
        }
    }
}


















export function applyGravity(vertices: Vertex[], center: P) {
    each(vertices, vertex => {
        const vecToCenter = vecFromTo(vertex.position, center);
        const distance = getVectorLen(vecToCenter);
        const direction = normaliseVec(vecToCenter);
        const force = G * sqr(vertexMass) / sqr(distance);
        const vector = multiplyVec(direction, force);
        vertex.applyForce(vector);
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


function getLargestSquare(vertices: Vertex[]): Square {
    const origin: P = vertices.reduce((NWmost, vertex) => {
        const { x, y } = vertex.position;
        return new P(
            min(NWmost.x, x),
            min(NWmost.y, y)
        );
    }, vertices[0].position.subtract(new P(10, 10)));

    const end: P = vertices.reduce((SEmost, vertex) => {
        const { x, y } = vertex.position;
        return new P(
            max(SEmost.x, x),
            max(SEmost.y, y)
        );
    }, vertices[0].position.add(new P(10, 10)));

    return { origin, end };
}


function cap(num: number, limit: number, isLowerBound: boolean): number {
    if (isLowerBound) {
        return num < limit ? limit : num;
    }
    return num > limit ? limit : num;
}
