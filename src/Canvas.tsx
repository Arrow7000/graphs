import React, { Component } from "react";

import VertexCollection from "./graphs/VertexCollection";
import EdgeCollection from "./graphs/EdgeCollection";

interface Size {
  width: number;
  height: number;
}

export interface EventHandlers {
  touchStart: ((event: TouchEvent) => void) | undefined;
  touchMove: ((event: TouchEvent) => void) | undefined;
  touchEnd: ((event: TouchEvent) => void) | undefined;
  touchCancel: ((event: TouchEvent) => void) | undefined;

  mouseDown: ((event: MouseEvent) => void) | undefined;
  mouseMove: ((event: MouseEvent) => void) | undefined;
  mouseUp: ((event: MouseEvent) => void) | undefined;
  mouseLeave: ((event: MouseEvent) => void) | undefined;

  doubleClick: ((event: MouseEvent) => void) | undefined;
}

interface Props extends EventHandlers {
  vertices: VertexCollection;
  edges: EdgeCollection;
  setCtx: (
    ctx: CanvasRenderingContext2D | null,
    width: number,
    height: number
  ) => void;
  onResize: ((width: number, height: number) => void) | undefined;
}

class Canvas extends Component<Props> {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;

  constructor() {
    super();
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    const { canvas } = this;
    const {
      // setCanvas,
      setCtx,

      touchStart,
      touchMove,
      touchEnd,
      touchCancel,

      mouseDown,
      mouseMove,
      mouseUp,
      mouseLeave,

      doubleClick
    } = this.props;
    console.log("canvas mounted");

    if (canvas) {
      console.log("canvas ref exists");
      // if (touchStart) {
      //   console.log("attaching touchstart event handler", touchStart);
      //   canvas.addEventListener("touchstart", touchStart, false);
      // }
      // if (touchMove) {
      //   canvas.addEventListener("touchmove", touchMove, false);
      // }
      // if (touchEnd) {
      //   canvas.addEventListener("touchend", touchEnd, false);
      // }
      // if (touchCancel) {
      //   canvas.addEventListener("touchcancel", touchCancel, false);
      // }

      // if (mouseDown) {
      //   canvas.addEventListener("mousedown", mouseDown, false);
      // }
      // if (mouseMove) {
      //   canvas.addEventListener("mouseMove", mouseMove, false);
      // }
      // if (mouseUp) {
      //   canvas.addEventListener("mouseup", mouseUp, false);
      // }
      // if (mouseLeave) {
      //   canvas.addEventListener("mouseleave", mouseLeave, false);
      // }

      // if (doubleClick) {
      //   canvas.addEventListener("dblclick", doubleClick, false);
      // }

      // setCanvas(canvas);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      this.ctx = canvas.getContext("2d");

      this.onResize(); // initial sizing
      window.addEventListener("resize", this.onResize, false);

      setCtx(this.ctx, width, height);
    }
  }

  componentWillUnmount() {
    const { canvas } = this;
    const {
      // setCanvas,
      setCtx,

      touchStart,
      touchMove,
      touchEnd,
      touchCancel,

      mouseDown,
      mouseMove,
      mouseUp,
      mouseLeave,

      doubleClick
    } = this.props;

    window.removeEventListener("resize", this.onResize);

    // if (canvas) {
    //   if (touchStart) {
    //     canvas.removeEventListener("touchstart", touchStart, false);
    //   }
    //   if (touchMove) {
    //     canvas.removeEventListener("touchmove", touchMove, false);
    //   }
    //   if (touchEnd) {
    //     canvas.removeEventListener("touchend", touchEnd, false);
    //   }
    //   if (touchCancel) {
    //     canvas.removeEventListener("touchcancel", touchCancel, false);
    //   }
    //   if (mouseDown) {
    //     canvas.removeEventListener("mousedown", mouseDown, false);
    //   }
    //   if (mouseMove) {
    //     canvas.removeEventListener("mouseMove", mouseMove, false);
    //   }
    //   if (mouseUp) {
    //     canvas.removeEventListener("mouseup", mouseUp, false);
    //   }
    //   if (mouseLeave) {
    //     canvas.removeEventListener("mouseleave", mouseLeave, false);
    //   }
    //   if (doubleClick) {
    //     canvas.removeEventListener("dblclick", doubleClick, false);
    //   }
    // }
  }

  onResize() {
    const { canvas, ctx, props } = this;
    if (canvas && ctx) {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Set internal pixel dimensions to actual canvas element pixel dimensions
      ctx.canvas.width = width;
      ctx.canvas.height = height;

      const { onResize } = props;

      if (onResize) {
        onResize(width, height);
      }
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
