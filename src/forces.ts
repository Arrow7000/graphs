import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Vertex from './Vertex';
import P from './Point';
import Edge from './Edge';
import { sqr, getVectorLen, getDistance, normaliseVec, vecFromTo, multiplyVec, getAvgPosition, setVecToLen, combineVectors } from './vectorMaths';
import { springLength, stiffness, vertexMass, coulombConst, vertexCharge, cappedElectro, electroCapStrengthDistance, theta, centerForce, G } from './config';
import {
    constructQuadTree, directions, QuadUnit, QuadParentUnit, QuadSubUnit, isQuadParent
} from './utils';


function coulombStrength(coulombConst: number, vertexCharge: number, distance: number): number {
    return coulombConst * (vertexCharge * vertexCharge) / sqr(distance / 2);
}

function getCoulombForce(node: Vertex, position: P, charge: number) {
    const vecToTarget = vecFromTo(node.position, position);
    const distance = getVectorLen(vecToTarget);
    // const distToUse = cappedElectro ? cap(distance, electroCapStrengthDistance, true) : distance;
    const strength = coulombStrength(coulombConst, charge, distance);
    const force = setVecToLen(vecToTarget, strength);

    return force;
}

export function applyElectrostatic(nodes: Vertex[], end: P) {
    // each(nodes, thisNode => {
    //     each(nodes, otherNode => {
    //         if (thisNode.id !== otherNode.id) {
    //             const distance = getDistance(thisNode.position, otherNode.position);

    //             const distToUse = cappedElectro ? cap(distance, electroCapStrengthDistance, true) : distance;
    //             const force = coulombForce(coulombConst, vertexCharge, distToUse);

    //             const vecToNode = vecFromTo(otherNode.position, thisNode.position);
    //             const normalisedDirection = normaliseVec(vecToNode);
    //             const vector = multiplyVec(normalisedDirection, force);

    //             thisNode.applyForce(vector);
    //         }
    //     });
    // });



    each(nodes, thisNode => {
        const tree = constructQuadTree(nodes, new P(0, 0), end);

        each(nodes, node => {
            const totalForce = traverser(node, tree);

            node.applyForce(totalForce);
        });
    });




    function traverser(node: Vertex, tree: QuadUnit): P {
        if (isQuadParent(tree)) {
            const distance = getVectorLen(vecFromTo(node.position, tree.centerOfCharge));
            const sByD = tree.width / distance;
            if (sByD < theta) { // use Barnes-Hut approximation
                const { centerOfCharge, totalCharge } = tree;
                const force = getCoulombForce(node, centerOfCharge, totalCharge);
                return force
            } else { // we need to go deeper

                const subtrees = filter(tree, (value, key) => {
                    return directions.includes(key);
                });

                const vectors = map(subtrees, subtree => {
                    return traverser(node, subtree);
                });

                const combinedVectors = combineVectors(vectors);
                return combinedVectors;
            }
        } else { // base case
            const { position, charge } = tree.vertex;
            const force = getCoulombForce(node, position, charge);
            return force
        }
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
