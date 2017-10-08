import Vertex from "./Vertex";
import Edge from "./Edge";
import VertexCollection from "./VertexCollection";
import EdgeCollection from "./EdgeCollection";
import P, { isP, floor, random } from "./Point";
// import { edgeWidth } from "./config";
import map from "lodash/map";

export function preRender(
  vertices: Vertex[],
  getAvgMomentum: (vertices: Vertex[]) => number,
  update: (visual?: boolean) => void,
  maxPrerenderTime: number,
  maxAvgMomentumLen: number
) {
  // Makes graph move around and lose some momentum before first render
  let avgMomentum = 0;
  let cycle = 0;

  const t0 = performance.now();
  do {
    update(false);
    avgMomentum = getAvgMomentum(vertices);
    cycle++;

    if (performance.now() - t0 > maxPrerenderTime) {
      break;
    }
  } while (avgMomentum > maxAvgMomentumLen);
  const t1 = performance.now();

  console.info(
    "Cycled " + cycle + " times before render, in " + (t1 - t0) + "ms"
  );
}

export function Updater(
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  func: () => void
) {
  function update() {
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);

    func();
    requestAnimationFrame(update);
  }

  update();
}

export function getClosestVertex(
  vertices: VertexCollection,
  point: P,
  excludeVertex?: Vertex
): Vertex | null {
  let closestDistance = Infinity;
  const closestVertex = vertices.toArray().reduce((last, vertex) => {
    if (vertex === excludeVertex) {
      return last;
    }

    const distance = vertex.position.getDistance(point);
    if (distance < closestDistance) {
      closestDistance = distance;
      return vertex;
    } else {
      return last;
    }
  }, null);
  return closestVertex;
}

export function distanceFromEdge(point: P, edge: Edge): number {
  const { a, b } = edge.vertices;
  const aPos = a.position;
  const bPos = isP(b) ? b : b.position;
  const distance = point.distanceToLine(aPos, bPos);
  return distance;
}

export function getClosestEdge(edges: EdgeCollection, point: P) {
  let closestDistance = Infinity;

  const closestEdge = edges.toArray().reduce((last, edge) => {
    const distance = distanceFromEdge(point, edge);
    if (distance < closestDistance) {
      closestDistance = distance;
      return edge;
    } else {
      return last;
    }
  }, null);
  return closestEdge;
}

const uuidChunk = () => floor(random() * 1000000);
export const uuid = () =>
  "" + uuidChunk() + "-" + uuidChunk() + "-" + uuidChunk();
