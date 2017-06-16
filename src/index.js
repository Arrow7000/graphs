import Vertex from './Vertex';
import Edge from './Edge';
import each from 'lodash/each';
import range from 'lodash/range';

const { random, floor } = Math;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;



const side = 1000;
const window = 250;


// const nodes = range(floor(random() * 15))
const nodes = range(7)
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
    .concat([new Edge(nodes[1], nodes[4])]);





let lastUpdate = new Date();
const { width, height } = canvas;
const center = { x: width / 2, y: height / 2 };

function update() {
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);



    each([...nodes, ...edges], obj => {
        obj.update(nodes, center);
        obj.render(ctx);
    });




    const now = +new Date();
    const msTillNextFrame = (lastUpdate + frame) - now;
    const timeTillUpdate = msTillNextFrame > 0 ? msTillNextFrame : 0;

    lastUpdate = now;
    setTimeout(() => {
        update();
    }, timeTillUpdate);
}

update();
