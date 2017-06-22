import each from 'lodash/each';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import { addVec, subtrVec, vecFromTo, multiplyVec, divideVec, getAvgPosition } from './vectorMaths';
import P from './Point';
import Vertex from './Vertex';


interface QuadSubUnit {
    vertex: Vertex;
}

// export type direction = 'upLeft' | 'downLeft' | 'upRight' | 'downRight';
export const directions = ['upLeft', 'downLeft', 'upRight', 'downRight'];

interface QuadParentUnit {
    totalMass: number;
    vertices: Vertex[];
    centerOfGravity: P;

    upLeft?: QuadUnit;
    downLeft?: QuadUnit;
    upRight?: QuadUnit;
    downRight?: QuadUnit;
}

type QuadUnit = QuadParentUnit | QuadSubUnit;

export function constructQuadTree(nodes: Vertex[], origin: P, endCorner: P): QuadUnit {
    if (nodes && nodes.length !== undefined && nodes.length > 1) {

        const grouped = groupBy(nodes, node => groupQuad(node, origin, endCorner));

        const quads = mapValues(grouped, (vertices, quarterName) => {
            const [newOrigin, newEndCorner] = getNewSquare(quarterName, origin, endCorner);
            return constructQuadTree(vertices, newOrigin, newEndCorner);
        });

        const { totalMass, totalPosition } = nodes.reduce((result, node) => {
            return {
                totalMass: result.totalMass + node.mass,
                totalPosition: addVec(result.totalPosition, node.position)
            };
        }, { totalMass: 0, totalPosition: new P(0, 0) });

        const centerOfGravity = divideVec(totalPosition, totalMass);

        return {
            ...quads,
            totalMass,
            centerOfGravity,
            vertices: nodes
        };

    } else {
        return { vertex: nodes[0] };
    }
}


function groupQuad(node: Vertex, origin: P, endCorner: P) {
    const centerX = origin.x + (endCorner.x - origin.x) / 2;
    const centerY = origin.y + (endCorner.y - origin.y) / 2;
    if (node.position.x < centerX) {
        return (node.position.y < centerY) ? 'upLeft' : 'downLeft'
    } else {
        return (node.position.y < centerY) ? 'upRight' : 'downRight'
    }
}

// returns [origin, endCorner] coordinates, depending on the quad
function getNewSquare(quad: string, origin: P, end: P): [P, P] {
    switch (quad) {
        case 'upLeft':
            // origin   = origin
            // end      = origin + ((end - origin) / 2)
            return [
                origin,
                addVec(origin, divideVec(subtrVec(end, origin), 2))
            ];

        case 'downLeft':
            // origin   = x: origin.x, y: origin.y + ((end.y - origin.y) / 2)
            // end      = x: origin.x + ((end.x - origin.x) / 2) ,y: end.y
            return [
                new P(origin.x, origin.y + ((end.y - origin.y) / 2)),
                new P(origin.x + ((end.x - origin.x) / 2), end.y)
            ];

        case 'upRight':
            // origin   = x: origin.x + ((end.x - origin.x) / 2), y: origin.y
            // end      = x: end.x, y: origin.y + ((end.y - origin.y) / 2)
            return [
                new P(origin.x + ((end.x - origin.x) / 2), origin.y),
                new P(end.x, origin.y + ((end.y - origin.y) / 2))
            ];

        case 'downRight':
            // origin   = origin + ((end - origin) / 2)
            // end      = end
            return [
                addVec(origin, divideVec(subtrVec(end, origin), 2)),
                end
            ];

        default:
            throw new Error('No such position exists');
    }
}





// class QuadSingle {
//     constructor(upLeft, upRight, bottomLeft, bottomRight) {
//         this.upLeft;
//     }
// }
