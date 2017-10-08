import React, { Component } from "react";

import VertexCollection from "./graphs/VertexCollection";
import EdgeCollection from "./graphs/EdgeCollection";

type CanvEl = HTMLCanvasElement;

export interface EventHandlers {
  touchStart: ((event: TouchEvent, canvas: CanvEl) => void) | undefined;
  touchMove: ((event: TouchEvent, canvas: CanvEl) => void) | undefined;
  touchEnd: ((event: TouchEvent, canvas: CanvEl) => void) | undefined;
  touchCancel: ((event: TouchEvent, canvas: CanvEl) => void) | undefined;

  mouseDown: ((event: MouseEvent, canvas: CanvEl) => void) | undefined;
  mouseMove: ((event: MouseEvent, canvas: CanvEl) => void) | undefined;
  mouseUp: ((event: MouseEvent, canvas: CanvEl) => void) | undefined;
  mouseLeave: ((event: MouseEvent, canvas: CanvEl) => void) | undefined;

  doubleClick: ((event: MouseEvent, canvas: CanvEl) => void) | undefined;
}

interface Props extends EventHandlers {
  vertices: VertexCollection;
  edges: EdgeCollection;
  setCtx:
    | ((
        ctx: CanvasRenderingContext2D | null,
        width: number,
        height: number
      ) => void)
    | undefined;
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

    if (canvas) {
      if (touchStart) {
        canvas.addEventListener(
          "touchstart",
          event => touchStart(event, canvas),
          false
        );
      }
      if (touchMove) {
        canvas.addEventListener(
          "touchmove",
          event => touchMove(event, canvas),
          false
        );
      }
      if (touchEnd) {
        canvas.addEventListener(
          "touchend",
          event => touchEnd(event, canvas),
          false
        );
      }
      if (touchCancel) {
        canvas.addEventListener(
          "touchcancel",
          event => touchCancel(event, canvas),
          false
        );
      }

      if (mouseDown) {
        canvas.addEventListener(
          "mousedown",
          event => mouseDown(event, canvas),
          false
        );
      }
      if (mouseMove) {
        canvas.addEventListener(
          "mousemove",
          event => mouseMove(event, canvas),
          false
        );
      }
      if (mouseUp) {
        canvas.addEventListener(
          "mouseup",
          event => mouseUp(event, canvas),
          false
        );
      }
      if (mouseLeave) {
        canvas.addEventListener(
          "mouseleave",
          event => mouseLeave(event, canvas),
          false
        );
      }

      if (doubleClick) {
        canvas.addEventListener(
          "dblclick",
          event => doubleClick(event, canvas),
          false
        );
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      this.ctx = canvas.getContext("2d");

      this.onResize(); // initial sizing
      window.addEventListener("resize", this.onResize, false);

      if (setCtx) {
        setCtx(this.ctx, width, height);
      }
    }
  }

  componentWillUnmount() {
    const { canvas } = this;
    const {
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
