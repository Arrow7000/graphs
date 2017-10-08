import P from "./Point";
import each from "lodash/each";
import range from "lodash/range";
import Vertex from "./Vertex";
import VertexCollection from "./VertexCollection";
import VertexCreator from "./VertexCreator";
import Edge from "./Edge";
import EdgeCollection from "./EdgeCollection";
import {
  applyElectrostatic,
  applySpring,
  applyCenterMovement
  // boxForce
} from "./forces";
import { getAvgMomentum } from "./forceUtils";
import { vertexRadius, backgroundColour } from "./config";
import { Updater } from "./helpers";
import handlersFactory from "./touchHandlers";

import "bulma/css/bulma.css";
import "./style.scss";

const { random, round } = Math;

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
const frame = 1000 / 60;

// Closures
let centerPoint = new P();
let widthProp = 0;
let heightProp = 0;

// closure getters
const getCenter = () => centerPoint;
const getWidth = () => widthProp;
const getHeight = () => heightProp;

// reassign closures
function canvasResize() {
  console.log("resizing");

  widthProp = canvas.offsetWidth;
  heightProp = canvas.offsetHeight;
  centerPoint = new P(widthProp / 2, heightProp / 2);

  ctx.canvas.width = widthProp;
  ctx.canvas.height = heightProp;
}

canvasResize();

// const side = Math.min(getWidth(), getHeight());
const nodesWindow = 300;

// const maxPrerenderLoops = 200;
const maxPrerenderTime = 1000; // ms
const maxAvgMomentumLen = 2.5;

const vertexCreator = new VertexCreator(getWidth() - 50, getHeight() - 50);

const vertices = new VertexCollection(
  range(13).map(() => {
    return new Vertex(
      getCenter().add(random() * nodesWindow - nodesWindow / 2)
    );
  })
);

const edgeArray = range(30)
  .map(() => {
    const vertexA = vertices.getRandom();
    const vertexB = vertices.getRandom();
    if (vertexA !== vertexB) {
      return new Edge(vertexA, vertexB);
    }
    return null;
  })
  .filter(item => item !== null);

const edges = new EdgeCollection(<Edge[]>edgeArray);

const {
  touchStart,
  touchMove,
  touchEnd,
  mouseStart,
  mouseMove,
  mouseEnd,
  doubleClick
} = handlersFactory(vertices, edges, vertexCreator);

// canvas.addEventListener("touchstart", touchStart, false);
// canvas.addEventListener("touchend", touchEnd, false);
// canvas.addEventListener("touchcancel", touchEnd, false);
// canvas.addEventListener("touchmove", touchMove, false);

// canvas.addEventListener("mousedown", mouseStart, false);
// canvas.addEventListener("mouseup", mouseEnd, false);
// canvas.addEventListener("mouseleave", mouseEnd, false);
// canvas.addEventListener("mousemove", mouseMove, false);

// canvas.addEventListener("dblclick", doubleClick, false);

window.addEventListener("resize", canvasResize, false);

function update(visible = true) {
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

// Makes graph move around and lose some momentum before first render
let avgMomentum = 0;
let cycle = 0;

const t0 = performance.now();
do {
  update(false);
  avgMomentum = getAvgMomentum(vertices.toArray());
  cycle++;

  if (performance.now() - t0 > maxPrerenderTime) {
    break;
  }
} while (avgMomentum > maxAvgMomentumLen);
const t1 = performance.now();

console.info(
  "Cycled " + cycle + " times before render, in " + (t1 - t0) + "ms"
);

Updater(getWidth(), getHeight(), ctx, update);
