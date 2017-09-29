import P from './Point';
import each from 'lodash/each';
import range from 'lodash/range';
import Vertex from './Vertex';
import Edge from './Edge';
import { applyElectrostatic, applySpring, applyCenterMovement } from './forces';
import { getAvgMomentum } from './utils';
import { vertexRadius, backgroundColour } from './config';
import { Updater } from './mainHelpers';
import handlers from './touchHandlers';

const { random } = Math;

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = <CanvasRenderingContext2D>(canvas.getContext('2d'));
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
    console.log('resizing');

    widthProp = canvas.offsetWidth;
    heightProp = canvas.offsetHeight;
    centerPoint = new P(widthProp / 2, heightProp / 2);

    ctx.canvas.width = widthProp;
    ctx.canvas.height = heightProp;
}

canvasResize();


const side = Math.min(getWidth(), getHeight());
const nodesWindow = 300;

// const maxPrerenderLoops = 200;
const maxPrerenderTime = 1000; // ms
const maxAvgMomentumLen = 2.5;

import * as network from './network';

const vertices = range(13)
    .map(() => {
        // const x = (side - window) / 2 + random() * window;
        // const y = (side - window) / 2 + random() * window;

        return new Vertex(getCenter().add((random() * nodesWindow) - nodesWindow / 2));
    });

const edges = range(4)
    .map(num => {
        const aIndex = num;
        const bIndex = num + 1;
        const vertexA = vertices[aIndex];
        const vertexB = vertices[bIndex];
        return new Edge(vertexA, vertexB);
    })
    .concat([
        new Edge(vertices[1], vertices[4]),
        new Edge(vertices[6], vertices[4]),
        new Edge(vertices[6], vertices[5]),
        new Edge(vertices[1], vertices[3]),
        new Edge(vertices[1], vertices[7]),
        new Edge(vertices[1], vertices[10]),
        new Edge(vertices[10], vertices[3]),
        new Edge(vertices[7], vertices[8]),
        new Edge(vertices[12], vertices[3]),
        new Edge(vertices[12], vertices[11]),
        new Edge(vertices[12], vertices[9]),
        new Edge(vertices[11], vertices[9]),
        new Edge(vertices[10], vertices[8]),
        new Edge(vertices[12], vertices[9]),
        new Edge(vertices[12], vertices[1]),
    ]);



// const nodes = network.nodes.map(() => {
//     const x = (side - window) / 2 + random() * window;
//     const y = (side - window) / 2 + random() * window;
//     return new Vertex(x, y);
// });

// const edges = network.edges.map(([from, to]) => {
//     return new Edge(nodes[from], nodes[to]);
// });



const { touchStart, touchMove, touchEnd, mouseStart, mouseMove, mouseEnd } = handlers(canvas, vertices, edges);

canvas.addEventListener("touchstart", touchStart, false);
canvas.addEventListener("touchend", touchEnd, false);
canvas.addEventListener("touchcancel", touchEnd, false);
canvas.addEventListener("touchmove", touchMove, false);

canvas.addEventListener("mousedown", mouseStart, false);
canvas.addEventListener("mouseup", mouseEnd, false);
canvas.addEventListener("mouseleave", mouseEnd, false);
canvas.addEventListener("mousemove", mouseMove, false);

window.addEventListener("resize", canvasResize, false);


const { round } = Math;

function update() {
    ctx.beginPath();
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, getWidth(), getHeight());

    applyElectrostatic(vertices);
    applySpring(edges);
    applyCenterMovement(vertices, getCenter());

    each(edges, edge => edge.render(ctx));

    each(vertices, node => {
        const { x, y } = node.position;
        node.setText(`(${round(x)}, ${round(y)})`)
        node.update();
        node.render(ctx);
    });

}



// Makes graph move around and lose some momentum before first render
let avgMomentum = 0;
let cycle = 0;

const t0 = performance.now();
do {
    update();
    avgMomentum = getAvgMomentum(vertices);
    cycle++;

    if (performance.now() - t0 > maxPrerenderTime) {
        break;
    }
} while (avgMomentum > maxAvgMomentumLen);
const t1 = performance.now();

console.info('Cycled ' + cycle + ' times before render, in ' + (t1 - t0) + 'ms');


Updater(getWidth(), getHeight(), ctx, update);
