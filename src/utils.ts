import each from 'lodash/each';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import { addVec, subtrVec, vecFromTo, multiplyVec, divideVec, getAvgPosition } from './Point';
import P from './Point';
import Vertex from './Vertex';


export interface ExternalNode {
    vertex: Vertex;
}

// export type direction = 'upLeft' | 'downLeft' | 'upRight' | 'downRight';
export const directions = ['NW', 'SW', 'NE', 'SE'];

// declare enum Quads {
//     NW,
//     NE,
//     SE,
//     SW,
// }

export interface InternalNode extends _.Dictionary<any> {
    totalCharge: number;
    vertices: Vertex[];
    centerOfCharge: P;
    width: number;

    NW?: QuadNode;
    SW?: QuadNode;
    NE?: QuadNode;
    SE?: QuadNode;
}

export type QuadNode = InternalNode | ExternalNode;

export function isInternalNode(quadUnit: QuadNode): quadUnit is InternalNode {
    return !!quadUnit['centerOfCharge'];
}

export function constructQuadTree(nodes: Vertex[], origin: P, endCorner: P, count?: number): QuadNode {

    if (nodes && nodes.length !== undefined && nodes.length > 1) {
        const squareVec = vecFromTo(origin, endCorner);
        const width = squareVec.x;

        const grouped = groupBy(nodes, node => groupQuad(node, origin, endCorner));

        const quads = mapValues(grouped, (vertices, quarterName) => {
            const [newOrigin, newEndCorner] = getNewSquare(quarterName, origin, endCorner);
            if (isNaN(vertices[0].position.x)) { debugger; }

            if (count > 100) {
                console.log(grouped);
                debugger;
            }
            return constructQuadTree(vertices, newOrigin, newEndCorner, count ? count + 1 : 1);
        });

        const { totalCharge, totalPosition } = nodes.reduce((result, node) => {
            return {
                totalCharge: result.totalCharge + node.charge,
                totalPosition: addVec(result.totalPosition, node.position)
            };
        }, { totalCharge: 0, totalPosition: new P(0, 0) });

        const centerOfCharge = divideVec(totalPosition, totalCharge);

        return {
            ...quads,
            totalCharge,
            centerOfCharge,
            vertices: nodes,
            width
        };

    } else {
        return { vertex: nodes[0] };
    }
}

function newQuadParent(): InternalNode {
    return {
        totalCharge: 0,
        vertices: [],
        centerOfCharge: new P(0, 0),
        width: 0
    }
}




function groupQuad(node: Vertex, origin: P, endCorner: P) {
    const centerX = origin.x + (endCorner.x - origin.x) / 2;
    const centerY = origin.y + (endCorner.y - origin.y) / 2;
    if (node.position.x < centerX) {
        return (node.position.y < centerY) ? 'NW' : 'SW'
    } else {
        return (node.position.y < centerY) ? 'NE' : 'SE'
    }
}

function isInSquare(point: P, origin: P, end: P): boolean {
    const originSquare = [origin, end].map(vec => vec.subtract(origin));
    const originPoint = point.subtract(origin);

    const xInSquare = (originPoint.x >= originSquare[0].x && originPoint.x <= originSquare[1].x) || (originPoint.x >= originSquare[1].x && originPoint.x <= originSquare[0].x);
    const yInSquare = (originPoint.y >= originSquare[0].y && originPoint.y <= originSquare[1].y) || (originPoint.y >= originSquare[1].y && originPoint.y <= originSquare[0].y);

    return xInSquare && yInSquare;
}

// returns [origin, endCorner] coordinates, depending on the quad
function getNewSquare(quad: string, origin: P, end: P): [P, P] {
    const centerPoint = origin.add(end.subtract(origin).divide(2));
    switch (quad) {
        case 'NW':
            // origin   = origin
            // end      = origin + ((end - origin) / 2)
            return [
                origin,
                centerPoint
            ];

        case 'SW':
            // origin   = x: origin.x, y: origin.y + ((end.y - origin.y) / 2)
            // end      = x: origin.x + ((end.x - origin.x) / 2) ,y: end.y
            return [
                new P(origin.x, origin.y + ((end.y - origin.y) / 2)),
                new P(origin.x + ((end.x - origin.x) / 2), end.y)
            ];

        case 'NE':
            // origin   = x: origin.x + ((end.x - origin.x) / 2), y: origin.y
            // end      = x: end.x, y: origin.y + ((end.y - origin.y) / 2)
            return [
                new P(origin.x + ((end.x - origin.x) / 2), origin.y),
                new P(end.x, origin.y + ((end.y - origin.y) / 2))
            ];

        case 'SE':
            // origin   = origin + ((end - origin) / 2)
            // end      = end
            return [
                centerPoint,
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


