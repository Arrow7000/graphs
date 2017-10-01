import Vertex from "./Vertex";
import P from "./Point";

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
  vertices: Vertex[],
  point: P,
  excludeVertex?: Vertex
): Vertex | null {
  let closestDistance = Infinity;
  const closestVertex = vertices.reduce((last, vertex) => {
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

const uuidChunk = () => floor(random() * 1000000);
export const uuid = () =>
  "" + uuidChunk() + "-" + uuidChunk() + "-" + uuidChunk();
