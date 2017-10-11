import Vertex from "./Vertex";
import Edge from "./Edge";
import VertexCollection from "./VertexCollection";
import EdgeCollection from "./EdgeCollection";
import Network from "./Network";
import P, { isP, floor, random } from "./Point";
// import { edgeWidth } from "./config";
import map from "lodash/map";
import each from "lodash/each";
import { getAvgMomentum } from "./forceUtils";

// interface Network {
//   vertices: VertexCollection;
//   edges: EdgeCollection;
// }

export function layoutPreRender(
  vertices: Vertex[],
  update: (visual?: boolean) => void,
  maxPrerenderTime: number,
  maxAvgMomentumLen: number,
  log = true
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

  if (log) {
    console.info(
      "Cycled " + cycle + " times before render, in " + (t1 - t0) + "ms"
    );
  }
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

type SerialisedVertices = string[];
interface SerialisedEdge {
  from: string;
  to: string;
}

interface SerialisedNetwork {
  vertices: SerialisedVertices;
  edges: SerialisedEdge[];
}

function serialiseNetwork(network: Network): SerialisedNetwork {
  const { vertices, edges } = network;

  const verticesSerial = vertices.toArray().map(vertex => vertex.id);
  const edgesSerial = edges
    .toArray()
    .filter(edge => edge.isConnected)
    .map(edge => {
      const { from, to } = edge;
      return { from: from.id, to: (to as Vertex).id };
    });

  return { vertices: verticesSerial, edges: edgesSerial };
}

export function storeNetwork(network: Network) {
  const serialised = serialiseNetwork(network);
  const stringified = JSON.stringify(serialised);

  localStorage.setItem("network", stringified);
}

export function getNetwork(): Network | null {
  const stringified = localStorage.getItem("network");
  if (stringified) {
    const parsed = <SerialisedNetwork>JSON.parse(stringified);

    const { vertices, edges } = parsed;
    const vertexArray = vertices.map(id => new Vertex(id));

    // const vertexCollection = new VertexCollection(vertexArray);
    const network = new Network(vertexArray);

    each(edges, edge => {
      const { from, to } = edge;
      const a = network.getVertex(from);
      const b = network.getVertex(to);

      const newEdge = new Edge(a, b);
      network.pushEdge(newEdge);
    });

    // const edgeCollection = new EdgeCollection(edgeArray);

    // return { vertices: vertexCollection, edges: edgeCollection };

    return network;
  } else {
    return null;
  }
}
