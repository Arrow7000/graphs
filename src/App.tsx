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
import { Updater } from "./graphs/helpers";
import handlersFactory from "./graphs/touchHandlers";
import VertexCreator from "./graphs/VertexCreator";
import P from "./graphs/Point";

import initNetwork from "./initNetwork";

const defaultSize = 100;

const { vertices, edges } = initNetwork(defaultSize);

const vertexCreator = new VertexCreator(50, 50); // @TODO: put it in right bottom corner

import { vertexRadius, backgroundColour } from "./graphs/config";

const { random, round } = Math;

const frame = 1000 / 60;

class App extends Component {
  ctx: CanvasRenderingContext2D | null;

  width: number;
  height: number;
  center: P;

  touchStart: (event: TouchEvent) => void;
  touchMove: (event: TouchEvent) => void;
  touchEnd: (event: TouchEvent) => void;
  mouseStart: (event: MouseEvent) => void;
  mouseMove: (event: MouseEvent) => void;
  mouseEnd: (event: MouseEvent) => void;
  doubleClick: (event: MouseEvent) => void;

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

    this.setCtx = this.setCtx.bind(this);
    this.ctxSet = this.ctxSet.bind(this);
    this.update = this.update.bind(this);
    this.setSize = this.setSize.bind(this);
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
  }

  ctxSet(width: number, height: number) {
    const { ctx, update } = this;

    this.setSize(width, height);

    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = backgroundColour;
      ctx.fillRect(0, 0, width, height);

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
