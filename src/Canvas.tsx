import React, { Component } from "react";

import VertexCollection from "./graphs/VertexCollection";
import EdgeCollection from "./graphs/EdgeCollection";

interface Props {
  vertices: VertexCollection;
  edges: EdgeCollection;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  setCtx: (ctx: CanvasRenderingContext2D | null) => void;
}

class Canvas extends Component<Props> {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;

  componentDidMount() {
    const { setCanvas, setCtx } = this.props;
    console.log("canvas mounted");
    if (this.canvas) {
      setCanvas(this.canvas);

      this.ctx = this.canvas.getContext("2d");
      setCtx(this.ctx);
    }
  }

  render() {
    return (
      <canvas className="canvas" ref={canvas => (this.canvas = canvas)}>
        Please update to a modern browser that supports canvas.
      </canvas>
    );
  }
}

export default Canvas;
