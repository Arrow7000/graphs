import React, { Component } from "react";
import Dashboard from "./Dashboard";
import Canvas, { EventHandlers } from "./Canvas";
import each from "lodash/each";
import {
  applyElectrostatic,
  applySpring,
  applyCenterMovement
  // boxForce
} from "./graphs/forces";
import { preRender, Updater } from "./graphs/helpers";
import handlersFactory from "./graphs/touchHandlers";
import VertexCreator from "./graphs/VertexCreator";
import P from "./graphs/Point";
import { getAvgMomentum } from "./graphs/forceUtils";

import initNetwork from "./initNetwork";

const defaultSize = 100;
const vertexCreatorMargin = 100;

const maxPrerenderTime = 1000; // ms
const maxAvgMomentumLen = 2.5;

const { vertices, edges } = initNetwork(defaultSize);

const vertexCreator = new VertexCreator(); // @TODO: put it in right bottom corner

import { vertexRadius, backgroundColour } from "./graphs/config";

const { random, round } = Math;

class App extends Component {
  ctx: CanvasRenderingContext2D | null;

  width: number;
  height: number;
  center: P;

  touchStart: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
  touchMove: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
  touchEnd: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
  mouseStart: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
  mouseMove: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
  mouseEnd: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
  doubleClick: (event: MouseEvent, canvas: HTMLCanvasElement) => void;

  constructor() {
    super();

    this.ctx = null;

    const {
      touchStart,
      touchMove,
      touchEnd,
      mouseStart,
      mouseMove,
      mouseEnd,
      doubleClick
    } = handlersFactory(vertices, edges, vertexCreator);

    this.touchStart = touchStart.bind(this);
    this.touchMove = touchMove.bind(this);
    this.touchEnd = touchEnd.bind(this);
    this.mouseStart = mouseStart.bind(this);
    this.mouseMove = mouseMove.bind(this);
    this.mouseEnd = mouseEnd.bind(this);
    this.doubleClick = doubleClick.bind(this);

    this.setSize = this.setSize.bind(this);
    this.setCtx = this.setCtx.bind(this);
    this.ctxSet = this.ctxSet.bind(this);
    this.update = this.update.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);

    this.setSize(defaultSize, defaultSize);
  }

  componentDidMount() {
    vertices.onChange(this.forceUpdate);
    edges.onChange(this.forceUpdate);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.center = new P(width / 2, height / 2);

    vertexCreator.changePosition(
      new P(width - vertexCreatorMargin, height - vertexCreatorMargin)
    );
  }

  ctxSet(width: number, height: number) {
    const { ctx, update } = this;

    this.setSize(width, height);

    if (ctx) {
      preRender(
        vertices.toArray(),
        getAvgMomentum,
        update,
        maxPrerenderTime,
        maxAvgMomentumLen
      );

      Updater(width, height, ctx, update);
    }
  }

  setCtx(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;

    this.ctxSet(width, height);
  }

  update(visible = true) {
    const { ctx, width, height, center } = this;
    if (ctx) {
      // `visible` param controls whether render method gets called
      ctx.beginPath();
      ctx.fillStyle = backgroundColour;
      ctx.fillRect(0, 0, width, height);

      applyElectrostatic(vertices.toArray());
      applySpring(edges.toArray());
      applyCenterMovement(vertices.toArray(), center);
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
    const {
      touchStart,
      touchMove,
      touchEnd,
      mouseStart,
      mouseMove,
      mouseEnd,
      doubleClick
    } = this;

    return (
      <div className="grid-container">
        <Dashboard vertices={vertices} edges={edges} />
        <Canvas
          onResize={this.setSize}
          vertices={vertices}
          edges={edges}
          setCtx={this.setCtx}
          touchStart={touchStart}
          touchMove={touchMove}
          touchEnd={touchEnd}
          touchCancel={touchEnd}
          mouseDown={mouseStart}
          mouseMove={mouseMove}
          mouseUp={mouseEnd}
          mouseLeave={mouseEnd}
          doubleClick={doubleClick}
        />
      </div>
    );
  }
}

export default App;
