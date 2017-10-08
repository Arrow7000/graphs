import P from "./Point";
import {
  damping,
  vertexMass,
  vertexRadius,
  vertexCharge,
  nodeBodyColour,
  edgeColour,
  borderWidth,
  backgroundColour
} from "./config";

class VertexCreator {
  position: P;

  /**
   * @TODO
   * - Make constructor accept getter function for dynamic values - eg position of vertexCreator relative to edge of viewport
   */
  constructor(x: number, y: number);
  constructor(point: P);
  constructor();
  constructor(xOrPoint: P | number = new P(), yCoord?: number) {
    // this.position =
    //   xOrPoint !== undefined
    //     ? yCoord !== undefined
    //       ? new P(<number>xOrPoint, yCoord)
    //       : new P(<P>xOrPoint)
    //     : new P();
    this.position = yCoord ? new P(<number>xOrPoint, yCoord) : <P>xOrPoint;
  }

  changePosition(position: P) {
    this.position = position;
  }

  render(ctx: CanvasRenderingContext2D) {
    // draws directly onto canvas
    const { x, y } = this.position;

    ctx.beginPath();
    ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
    ctx.fillStyle = backgroundColour;
    ctx.fill();

    // ctx.lineWidth = 3 + .1 * this.stress;
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = edgeColour;
    ctx.stroke();
  }
}

export default VertexCreator;
