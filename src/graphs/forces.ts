import each from "lodash/each";
import map from "lodash/map";
import range from "lodash/range";
import filter from "lodash/filter";
import Vertex from "./Vertex";
import P, {
  sqr,
  getVectorLen,
  getDistance,
  normaliseVec,
  vecFromTo,
  multiplyVec,
  getAvgPosition,
  setVecToLen,
  combineVectors,
  maxVec,
  isP,
  toBox
} from "../vectors/Point";
import Edge from "./Edge";
import {
  springLength,
  stiffness,
  vertexMass,
  coulombConst,
  vertexCharge,
  cappedElectro,
  electroCapStrengthDistance,
  theta,
  centerForce,
  G
} from "./config";
import {
  constructQuadTree,
  directions,
  QuadNode,
  BranchNode,
  LeafNode,
  isNotLeafNode,
  Square
} from "./forceUtils";

const { min, max } = Math;
const fps = 60;

export function coulombStrength(
  coulombConst: number,
  charge1: number,
  charge2: number,
  distance: number
): number {
  if (distance < 0.0001) {
    throw new Error("Distance is too close to 0 for safe calculation");
  }
  return (coulombConst * charge1 * charge2) / sqr(distance / 2);
}

export function getCoulombForce(
  from: P,
  to: P,
  charge1: number,
  charge2: number
): P {
  const vecToTarget = from.vecTo(to);
  const distance = vecToTarget.length;

  if (distance <= 0 || distance === Infinity) {
    throw new Error(`Distance is ${distance}`);
  }

  const strength = coulombStrength(coulombConst, charge1, charge2, distance);
  const force = vecToTarget.toLen(-strength);

  return force;
}

export function applyElectrostatic(vertices: Vertex[]) {
  const square = getLargestSquare(vertices);
  const tree = constructQuadTree(vertices, square);

  each(vertices, vertex => {
    const totalForce = maxVec(getTreeForce(vertex, tree), 100);
    vertex.applyForce(totalForce);
  });
}

function getTreeForce(vertex: Vertex, tree: QuadNode): P {
  if (!isNotLeafNode(tree)) {
    // if is external
    const { id, position, charge } = tree.vertex;
    if (id === vertex.id) {
      return new P(0, 0); // no force if is the same node
    }
    const force = getCoulombForce(
      vertex.position,
      position,
      vertex.charge,
      charge
    );
    return force;
  } else {
    const distance = vertex.position.vecTo(tree.centerOfCharge).length;
    const sByD = tree.squareWidth / distance;
    // log(sByD);
    if (sByD < theta) {
      const { centerOfCharge, totalCharge } = tree;
      const force = getCoulombForce(
        vertex.position,
        centerOfCharge,
        vertex.charge,
        totalCharge
      );
      return force;
    } else {
      const subtrees = filter(tree, (value, key) => directions.includes(key));
      const vectors = map(subtrees, subtree => getTreeForce(vertex, subtree));
      const combinedVectors = combineVectors(vectors);
      return combinedVectors;
    }
  }
}

export function applyGravity(vertices: Vertex[], center: P) {
  each(vertices, vertex => {
    const vecToCenter = vertex.position.vecTo(center);
    const distance = vecToCenter.length;
    const direction = vecToCenter.normalise();
    const force = (G * sqr(vertexMass)) / sqr(distance);
    const vector = direction.multiply(force);
    vertex.applyForce(vector);
  });
}

// Hooke's law: F = -k(x - x0)
function springForce(
  stiffness: number,
  springLength: number,
  distance: number
): number {
  return -stiffness * (springLength - distance);
}

export function applySpring(edges: Edge[]) {
  each(edges, edge => {
    const { a, b } = edge.vertices;
    const distance = edge.length;
    const bIsP = isP(b);
    const bPos = bIsP ? <P>b : (<Vertex>b).position;

    const forceVectorLength = springForce(stiffness, springLength, distance);
    const eachForce = forceVectorLength / 2;

    const vecAtoB = vecFromTo(a.position, bPos);
    const directionFromAtoB = normaliseVec(vecAtoB);
    const forceAtoB = multiplyVec(directionFromAtoB, eachForce);
    a.applyForce(forceAtoB);

    const forceBtoA = multiplyVec(forceAtoB, -1);
    if (!bIsP) {
      (<Vertex>b).applyForce(forceBtoA);
    }
  });
}

// false force, operates directly on position, not velocity
export function applyCenterMovement(nodes: Vertex[], center: P) {
  const timeToCenter = 2000;
  const avgPosition = getAvgPosition(nodes.map(node => node.position));
  const toCenter = avgPosition.vecTo(center);
  const moveNow =
    toCenter.length < 1 ? toCenter : toCenter.divide(timeToCenter / fps);

  const okToCenter = nodes.filter(vertex => vertex.dragging).length < 1;

  if (okToCenter) {
    // only center when not dragging any vertices
    each(nodes, node => {
      const vector = moveNow.multiply(centerForce);
      node.applyMovement(vector);
    });
  }
}

// export function boxForce(vertices: Vertex[], origin: P, end: P) {
//   each(vertices, vertex => {
//     const nextPosition = vertex.position.add(vertex.velocity);
//     const toBound = toBox(nextPosition, origin, end);

//     vertex.applyMovement(toBound);
//   });
// }

export function getLargestSquare(vertices: Vertex[]): Square {
  // const marginPoint = new P(50, 50);

  const startPt = vertices.length > 0 ? vertices[0].position : new P();

  const origin: P = vertices.reduce((NWmost, vertex) => {
    const { x, y } = vertex.position;
    return new P(min(NWmost.x, x), min(NWmost.y, y));
  }, startPt);
  // .subtract(marginPoint);

  const end: P = vertices.reduce((SEmost, vertex) => {
    const { x, y } = vertex.position;
    return new P(max(SEmost.x, x), max(SEmost.y, y));
  }, startPt);
  // .add(marginPoint);

  return [origin, end];
}
