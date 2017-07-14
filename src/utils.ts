import each from 'lodash/each';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import { addVec, subtrVec, vecFromTo, multiplyVec, divideVec, getAvgPosition, sqrt } from './Point';
import P from './Point';
import Vertex from './Vertex';


export interface ExternalNode {
    vertex: Vertex;
}

// export type direction = 'upLeft' | 'downLeft' | 'upRight' | 'downRight';
export const directions = ['NW', 'SW', 'NE', 'SE'];

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
    return !!(<InternalNode>quadUnit).centerOfCharge;
}

export interface Square {
    origin: P;
    end: P;
}

export function constructQuadTree(nodes: Vertex[], square: Square, ctx?: CanvasRenderingContext2D, depth?: number): QuadNode {

    const { origin, end } = square;

    if (nodes && nodes.length !== undefined && nodes.length > 1) {
        const squareVec = vecFromTo(origin, end);
        const width = squareVec.x;

        const grouped = groupBy(nodes, node => groupQuad(node, square));

        const quads = mapValues(grouped, (vertices, quarterName) => {
            const newSquare = getNewSquare(quarterName, square);

            return constructQuadTree(vertices, newSquare, ctx, depth ? depth + 1 : 1);
        });


        const { totalCharge, totalPosition } = nodes.reduce((result, node) => {
            return {
                totalCharge: result.totalCharge + node.charge,
                totalPosition: result.totalPosition.add(node.position.multiply(node.charge))
            };
        }, { totalCharge: 0, totalPosition: new P(0, 0) });

        const centerOfCharge = totalPosition.divide(totalCharge);
        // console.log(centerOfCharge);


        // DRAWING SQUARES
        if (ctx) {

            ctx.beginPath();
            ctx.lineWidth = 4 / depth;
            ctx.rect(origin.x, origin.y, end.x - origin.x, end.y - origin.y);
            ctx.stroke();

            ctx.beginPath();
            const radius = sqrt(totalCharge / Math.PI) * 1.5;
            ctx.arc(centerOfCharge.x, centerOfCharge.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.fillStyle = 'black';
        }

        // END OF DRAWING SQUARES


        return {
            ...quads,
            totalCharge,
            centerOfCharge,
            vertices: nodes,
            width
        };

    } else {

        if (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 4 / depth;
            ctx.rect(origin.x, origin.y, end.x - origin.x, end.y - origin.y);
            ctx.stroke();
        }


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




function groupQuad(node: Vertex, { origin, end }: Square) {
    const centerX = origin.x + (end.x - origin.x) / 2;
    const centerY = origin.y + (end.y - origin.y) / 2;
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
function getNewSquare(quad: string, { origin, end }: Square): Square {
    const centerPoint = origin.add(end.subtract(origin).divide(2));
    switch (quad) {
        case 'NW':
            // origin   = origin
            // end      = origin + ((end - origin) / 2)
            return {
                origin,
                end: centerPoint
            };

        case 'SW':
            // origin   = x: origin.x, y: origin.y + ((end.y - origin.y) / 2)
            // end      = x: origin.x + ((end.x - origin.x) / 2) ,y: end.y
            return {
                origin: new P(origin.x, origin.y + ((end.y - origin.y) / 2)),
                end: new P(origin.x + ((end.x - origin.x) / 2), end.y)
            };

        case 'NE':
            // origin   = x: origin.x + ((end.x - origin.x) / 2), y: origin.y
            // end      = x: end.x, y: origin.y + ((end.y - origin.y) / 2)
            return {
                origin: new P(origin.x + ((end.x - origin.x) / 2), origin.y),
                end: new P(end.x, origin.y + ((end.y - origin.y) / 2))
            };

        case 'SE':
            // origin   = origin + ((end - origin) / 2)
            // end      = end
            return {
                origin: centerPoint,
                end
            };

        default:
            throw new Error('No such position exists');
    }
}

export function getAvgMomentum(nodes: Vertex[]): number {
    return nodes
        .map(vertex => vertex.getMomentum().length())
        .reduce((total, momentum) => {
            return total + momentum;
        }, 0) / nodes.length;
}



// class QuadSingle {
//     constructor(upLeft, upRight, bottomLeft, bottomRight) {
//         this.upLeft;
//     }
// }


