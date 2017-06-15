import Vertex from './Vertex';
import Edge from './Edge';
import each from 'lodash/each';


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;






const node1 = new Vertex(300, 300);
node1.applyForce({ x: 5, y: 0 })
const node2 = new Vertex(600, 600);
const edge = new Edge(node1, node2);

const objects = [
    node1,
    node2,
    edge,
];






let lastUpdate = new Date();
const { width, height } = canvas;

function update() {
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);



    each(objects, obj => {
        obj.update();
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
