import Vertex from "./Vertex";
import P, { getDistance, isP } from "./Point";
import { edgeColour, vertexRadius, edgeWidth } from "./config";
import { uuid } from "./helpers";

class Edge {
  id: string;
  directed: boolean;
  vertices: {
    a: Vertex;
    b: Vertex | P;
  };

  constructor(vertexA: Vertex, vertexB: Vertex | P, directed = true) {
    this.id = uuid();
    this.vertices = {
      a: vertexA,
      b: vertexB
    };
    this.directed = directed;
  }

  getLength() {
    const { a, b } = this.vertices;
    const bPos = isP(b) ? b : b.position;
    const distance = getDistance(a.position, bPos);
    return distance;
  }

  setPointB(point: P) {
    if (this.vertices.b instanceof P) {
      this.vertices.b = point;
    } else {
      throw new Error("Only allowed to move point `b` if it is not a vertex");
    }
  }

  attachToVertex(vertex: Vertex) {
    this.vertices.b = vertex;
  }

  render(ctx: CanvasRenderingContext2D) {
    const { a, b } = this.vertices;
    const bPos = isP(b) ? b : b.position;

    ctx.beginPath();
    // ctx.lineWidth = 2;
    ctx.lineWidth = edgeWidth / 2;
    ctx.moveTo(a.position.x, a.position.y);
    ctx.lineTo(bPos.x, bPos.y);
    ctx.strokeStyle = edgeColour;
    ctx.stroke();

    if (this.directed) {
      const { a, b } = this.vertices;
      const { x, y } = bPos;
      const lineVec = a.position.vecTo(bPos);
      const angle = lineVec.getAngle() + 90;

      const sideLen = 15;
      const center = bPos;

      const triangleTip = center.add(
        new P(0, vertexRadius + edgeWidth / 2).rotate(angle)
      );

      const vertical = new P(0, sideLen);
      const rotationDegrees = 30;
      const toA = vertical.rotate(rotationDegrees);
      const toB = vertical.rotate(-rotationDegrees);

      const triangleA = triangleTip.add(toA).rotate(angle, triangleTip);
      const triangleB = triangleTip.add(toB).rotate(angle, triangleTip);

      ctx.beginPath();
      ctx.moveTo(triangleTip.x, triangleTip.y);

      ctx.lineWidth = edgeWidth;
      ctx.fillStyle = edgeColour;
      ctx.lineTo(triangleA.x, triangleA.y);
      ctx.lineTo(triangleB.x, triangleB.y);
      ctx.lineTo(triangleTip.x, triangleTip.y);

      ctx.fill();
    }
  }
}

export default Edge;
