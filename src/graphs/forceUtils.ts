import mapValues from "lodash/mapValues";
import groupBy from "lodash/groupBy";
import P, { sqrt } from "../vectors/Point";
import Vertex from "./Vertex";

// export type direction = 'upLeft' | 'downLeft' | 'upRight' | 'downRight';

// @TODO: could probably refactor this to use an enum
type Direction = "NW" | "SW" | "NE" | "SE";
export const directions: Direction[] = ["NW", "SW", "NE", "SE"];
export const [NW, SW, NE, SE]: Direction[] = directions;

export interface LeafNode {
  vertex: Vertex | null;
  squareWidth: number;
}

export interface BranchNode {
  totalCharge: number;
  vertices: Vertex[];
  centerOfCharge: P;
  squareWidth: number;

  NW?: QuadNode;
  SW?: QuadNode;
  NE?: QuadNode;
  SE?: QuadNode;
}

export type QuadNode = BranchNode | LeafNode;

export function isNotLeafNode(quadUnit: QuadNode): quadUnit is BranchNode {
  return !!(quadUnit as BranchNode).centerOfCharge;
}

export type Square = [P, P];

export function constructQuadTree(
  nodes: Vertex[],
  square: Square,
  // ctx?: CanvasRenderingContext2D,
  depth = 0
): QuadNode {
  const [origin, end] = square;
  const squareVec = origin.vecTo(end);
  const squareWidth = squareVec.x;

  if (nodes.length > 1) {
    const grouped = groupBy(nodes, node => getQuadOfVertex(square, node));

    const quads = mapValues(grouped, (vertices, quarterName: Direction) => {
      const newSquare = getSubSquareByDirection(square, quarterName);

      return constructQuadTree(vertices, newSquare, depth + 1);
    });

    const { totalCharge, totalPosition } = nodes.reduce(
      (result, node) => {
        return {
          totalCharge: result.totalCharge + node.charge,
          totalPosition: result.totalPosition.add(
            node.position.multiply(node.charge)
          )
        };
      },
      { totalCharge: 0, totalPosition: new P(0, 0) }
    );

    const centerOfCharge = totalPosition.divide(totalCharge);
    // console.log(centerOfCharge);

    // DRAWING SQUARES
    // if (ctx) {
    //   ctx.beginPath();
    //   ctx.lineWidth = 4 / depth;
    //   ctx.rect(origin.x, origin.y, end.x - origin.x, end.y - origin.y);
    //   ctx.stroke();

    //   ctx.beginPath();
    //   const radius = sqrt(totalCharge / Math.PI) * 1.5;
    //   ctx.arc(centerOfCharge.x, centerOfCharge.y, radius, 0, 2 * Math.PI);
    //   ctx.fillStyle = "orange";
    //   ctx.fill();
    //   ctx.fillStyle = "black";
    // }

    // END OF DRAWING SQUARES

    return {
      ...quads,
      totalCharge,
      centerOfCharge,
      vertices: nodes,
      squareWidth
    };
  } else if (nodes.length === 1) {
    // if (ctx) {
    //   ctx.beginPath();
    //   ctx.lineWidth = 4 / depth;
    //   ctx.rect(origin.x, origin.y, end.x - origin.x, end.y - origin.y);
    //   ctx.stroke();
    // }

    return { vertex: nodes[0], squareWidth };
  } else {
    return { vertex: null, squareWidth };
  }
}

const newQuadParent = (): BranchNode => ({
  totalCharge: 0,
  vertices: [],
  centerOfCharge: new P(0, 0),
  squareWidth: 0
});

export function getQuadOfVertex(square: Square, node: Vertex): Direction {
  if (!isInSquare(square, node.position)) {
    throw new Error("Vertex is outside square");
  }
  const [origin, end] = square;
  const halfDiagonal = end.subtract(origin).divide(2);
  const halfWidth = halfDiagonal.x;
  const halfHeight = halfDiagonal.y;

  const centerX = origin.x + halfWidth;
  const centerY = origin.y + halfHeight;

  const isNorth = node.position.y < centerY;

  // isWest
  if (node.position.x < centerX) {
    return isNorth ? NW : SW;
  } else {
    return isNorth ? NE : SE;
  }
}

export function isInSquare([origin, end]: Square, point: P): boolean {
  const xInSquare = point.x >= origin.x && point.x <= end.x;
  const yInSquare = point.y >= origin.y && point.y <= end.y;
  return xInSquare && yInSquare;
}

// returns [origin, endCorner] coordinates, depending on the quad
export function getSubSquareByDirection(
  [origin, end]: Square,
  direction: Direction
): Square {
  const halfDiagonal = end.subtract(origin).divide(2);
  const halfWidth = halfDiagonal.x;
  const halfHeight = halfDiagonal.y;
  const centerPoint = origin.add(halfDiagonal);

  const makeQuadFromOrigin = (point: P): Square => [
    point,
    point.add(halfDiagonal)
  ];

  switch (direction) {
    case NW:
      return makeQuadFromOrigin(origin);
    case SW:
      return makeQuadFromOrigin(new P(origin.x, origin.y + halfHeight));
    case NE:
      return makeQuadFromOrigin(new P(origin.x + halfWidth, origin.y));
    case SE:
      return makeQuadFromOrigin(centerPoint);
    default:
      throw new Error(`'${direction}' is not a valid direction`);
  }
}

export function getAvgMomentum(nodes: Vertex[]): number {
  if (nodes.length < 1) {
    return 0;
  }
  return (
    nodes
      .map(vertex => vertex.momentum.length)
      .reduce((total, momentum) => total + momentum, 0) / nodes.length
  );
}

// class QuadSingle {
//     constructor(upLeft, upRight, bottomLeft, bottomRight) {
//         this.upLeft;
//     }
// }
