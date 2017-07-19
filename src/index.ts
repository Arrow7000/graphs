import P from './Point';
import each from 'lodash/each';
import range from 'lodash/range';
import Vertex from './Vertex';
import Edge from './Edge';
import { applyElectrostatic, applySpring, applyCenterMovement } from './forces';
import { constructQuadTree, getAvgMomentum } from './utils';
import { vertexRadius, backgroundColour } from './config';
import { Updater } from './mainHelpers';
import handlers from './touchHandlers';

const { random } = Math;

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;

/**
 * Roadmap
 * - Decide on format for storing networks
 * - Make canvas resize to size of viewport - maybe use requestAnimationFrame
 * - Optionally also 'zoom' in or out virtually depending on viewport size
 * V - Colour nodes and edges
 * - Allow user to create new nodes
 * - Allow user to create new edges between nodes (by clicking on node's edge and dragging to another one)
 * - Create import tool
 * - create connectors to interface with import tool - e.g. import friends list from FB or Twitter followers network
 * V - Create directed edges, with arrow to display direction
 * - Create dashboard
 */

 /**
  * Dashboard
  * - Allow user to save current state
  * - Allow user to select from multiple saved states
  */

const side = 1500;
const window = 300;

const maxPrerenderLoops = 200;
const maxAvgMomentumLen = 5;

import * as network from './network';

const nodes = range(13)
    .map(() => {
        const x = (side - window) / 2 + random() * window;
        const y = (side - window) / 2 + random() * window;
        return new Vertex(x, y);
    });

const edges = range(4)
    .map(num => {
        const aIndex = num;
        const bIndex = num + 1;
        const nodeA = nodes[aIndex];
        const nodeB = nodes[bIndex];
        return new Edge(nodeA, nodeB);
    })
    .concat([
        new Edge(nodes[1], nodes[4]),
        new Edge(nodes[6], nodes[4]),
        new Edge(nodes[6], nodes[5]),
        new Edge(nodes[1], nodes[3]),
        new Edge(nodes[1], nodes[7]),
        new Edge(nodes[1], nodes[10]),
        new Edge(nodes[10], nodes[3]),
        new Edge(nodes[7], nodes[8]),
        new Edge(nodes[12], nodes[3]),
        new Edge(nodes[12], nodes[11]),
        new Edge(nodes[12], nodes[9]),
        new Edge(nodes[11], nodes[9]),
        new Edge(nodes[10], nodes[8]),
        new Edge(nodes[12], nodes[9]),
        new Edge(nodes[12], nodes[1]),
    ]);



// const nodes = network.nodes.map(() => {
//     const x = (side - window) / 2 + random() * window;
//     const y = (side - window) / 2 + random() * window;
//     return new Vertex(x, y);
// });

// const edges = network.edges.map(([from, to]) => {
//     return new Edge(nodes[from], nodes[to]);
// });



const { touchStart, touchMove, touchEnd, mouseStart, mouseMove, mouseEnd } = handlers(canvas, nodes);

canvas.addEventListener("touchstart", touchStart, false);
canvas.addEventListener("touchend", touchEnd, false);
canvas.addEventListener("touchcancel", touchEnd, false);
canvas.addEventListener("touchmove", touchMove, false);

canvas.addEventListener("mousedown", mouseStart, false);
canvas.addEventListener("mouseup", mouseEnd, false);
canvas.addEventListener("mouseleave", mouseEnd, false);
canvas.addEventListener("mousemove", mouseMove, false);



const width = +canvas.getAttribute('width');
const height = +canvas.getAttribute('height');
const center = new P(width / 2, height / 2);

const { round } = Math;

function update() {
    ctx.beginPath();
    // ctx.fillStyle = 'black';
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, width, height);

    applyElectrostatic(nodes);
    applySpring(edges);
    applyCenterMovement(nodes, center);

    each(edges, edge => {
        edge.render(ctx);
    });

    each(nodes, node => {
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
    avgMomentum = getAvgMomentum(nodes);
    cycle++;
} while (avgMomentum > maxAvgMomentumLen && cycle < maxPrerenderLoops)
const t1 = performance.now();

console.info('Cycled ' + cycle + ' times before render, in ' + (t1 - t0) + 'ms');


Updater(width, height, ctx, update);
