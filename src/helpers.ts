import Vertex from "./Vertex";
import Edge from "./Edge";
import VertexCollection from "./VertexCollection";
import EdgeCollection from "./EdgeCollection";
import P, { isP, floor, random } from "./Point";
// import { edgeWidth } from "./config";
import map from "lodash/map";

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
    if (vertex === excludeVertex) return last;

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
  console.log({ distance });
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
  console.log({ closestDistance });
  return closestEdge;
}

const uuidChunk = () => floor(random() * 1000000);
export const uuid = () =>
  "" + uuidChunk() + "-" + uuidChunk() + "-" + uuidChunk();
