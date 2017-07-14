import P from './Point';
import each from 'lodash/each';
import range from 'lodash/range';
import Vertex from './Vertex';
import Edge from './Edge';
import { applyElectrostatic, applySpring, applyCenterMovement } from './forces';
import { constructQuadTree, getAvgMomentum } from './utils';
import { vertexRadius } from './config';
import { Updater } from './mainHelpers';
import handlers from './touchHandlers';

const { random } = Math;

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;

/**
 * @TODO:
 * - Let simulation run for a few hundred ticks so that network can stabilise before being rendered to the user
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

// interface TouchHolder {
//     [key: number]: Vertex;
// }
// const touches: TouchHolder = {};

// const nodes = network.nodes.map(() => {
//     const x = (side - window) / 2 + random() * window;
//     const y = (side - window) / 2 + random() * window;
//     return new Vertex(x, y);
// });

// const edges = network.edges.map(([from, to]) => {
//     return new Edge(nodes[from], nodes[to]);
// });



const { handleStart, handleMove, handleEnd } = handlers(canvas, nodes);

canvas.addEventListener("touchstart", handleStart, false);
canvas.addEventListener("touchend", handleEnd, false);
canvas.addEventListener("touchcancel", handleEnd, false);
canvas.addEventListener("touchmove", handleMove, false);



const width = +canvas.getAttribute('width');
const height = +canvas.getAttribute('height');
const center = new P(width / 2, height / 2);


function update() {
    applyElectrostatic(nodes);
    applySpring(edges);
    applyCenterMovement(nodes, center);

    each(nodes, node => {
        node.update();
        node.render(ctx);
    });

    each(edges, edge => {
        edge.render(ctx);
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


Updater(width, height, frame, ctx, update);


// setTimeout(function () {
//     console.log(constructQuadTree(nodes, new P(0, 0), new P(width, height)));
// }, 1000);

