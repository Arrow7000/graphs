import React, { Component } from "react";
import Dashboard from "./Dashboard";
import Canvas from "./Canvas";
import each from "lodash/each";
import {
  applyElectrostatic,
  applySpring,
  applyCenterMovement,
  boxForce
} from "./graphs/forces";
import { Updater } from "./graphs/helpers";
import handlersFactory from "./graphs/touchHandlers";
import VertexCreator from "./graphs/VertexCreator";

import initNetwork from "./initNetwork";
const {
  vertices,
  edges,
  canvasResize,
  getWidth,
  getHeight,
  getCenter
} = initNetwork();
const vertexCreator = new VertexCreator(getWidth() - 50, getHeight() - 50);

import { vertexRadius, backgroundColour } from "./graphs/config";

const { random, round } = Math;

const frame = 1000 / 60;

class App extends Component {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;

  constructor() {
    super();

    this.canvas = null;
    this.ctx = null;

    this.setCanvas = this.setCanvas.bind(this);
    this.setCtx = this.setCtx.bind(this);
    this.update = this.update.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeThisCanvas, false);

    vertices.onChange(this.forceUpdate);
    edges.onChange(this.forceUpdate);
  }

  ctxSet() {
    const { ctx, canvas, update } = this;
    console.log("running ctxSet");

    if (ctx && canvas) {
      console.log("initial canvas resize:", getWidth(), getHeight());
      this.resizeThisCanvas();
      ctx.beginPath();
      ctx.fillStyle = backgroundColour;
      ctx.fillRect(0, 0, getWidth(), getHeight());

      const {
        touchStart,
        touchMove,
        touchEnd,
        mouseStart,
        mouseMove,
        mouseEnd,
        doubleClick
      } = handlersFactory(canvas, vertices, edges, vertexCreator);

      canvas.addEventListener("touchstart", touchStart, false);
      canvas.addEventListener("touchend", touchEnd, false);
      canvas.addEventListener("touchcancel", touchEnd, false);
      canvas.addEventListener("touchmove", touchMove, false);

      canvas.addEventListener("mousedown", mouseStart, false);
      canvas.addEventListener("mouseup", mouseEnd, false);
      canvas.addEventListener("mouseleave", mouseEnd, false);
      canvas.addEventListener("mousemove", mouseMove, false);

      canvas.addEventListener("dblclick", doubleClick, false);

      Updater(getWidth(), getHeight(), ctx, update);
    }
  }

  resizeThisCanvas() {
    // @TODO: figure out why the fuck getWidth and getHeight are returning 100 after this.canvas and this.ctx have been set
    console.log("resizing canvas", getWidth(), getHeight());
    if (!this.canvas || !this.ctx) {
      // debugger;
    }
    canvasResize(this.canvas, this.ctx);
  }

  setCanvas(canvas: HTMLCanvasElement | null) {
    console.log("setting canvas");
    if (canvas) {
      this.canvas = canvas;
    }
  }
  setCtx(ctx: CanvasRenderingContext2D | null) {
    console.log("setting ctx");
    if (ctx) {
      this.ctx = ctx;

      this.ctxSet();
    }
  }

  update(visible = true) {
    const { ctx } = this;
    if (ctx) {
      // `visible` param controls whether render method gets called
      ctx.beginPath();
      ctx.fillStyle = backgroundColour;
      ctx.fillRect(0, 0, getWidth(), getHeight());

      applyElectrostatic(vertices.toArray());
      applySpring(edges.toArray());
      applyCenterMovement(vertices.toArray(), getCenter());
      // boxForce(vertices.toArray(), new P(), new P(getWidth(), getHeight()));

      each(edges.toArray(), edge => edge.render(ctx));

      each(vertices.toArray(), vertex => {
        const { x, y } = vertex.position;
        vertex.setText(`(${round(x)}, ${round(y)})`);
        vertex.update();
        if (visible) {
          vertex.render(ctx);
        }
      });

      if (visible) {
        vertexCreator.render(ctx);
      }
    }
  }

  render() {
    return (
      <div className="grid-container">
        <Dashboard vertices={vertices} edges={edges} />
        <Canvas
          vertices={vertices}
          edges={edges}
          setCanvas={this.setCanvas}
          setCtx={this.setCtx}
        />
      </div>
    );
  }
}

export default App;
