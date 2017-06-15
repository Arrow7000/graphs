import Node from './Node';

const node = new Node(0, 0);

let goingRight = true;

setInterval(() => {
    const momentum = getVectorLen(node.getMomentum());
    if (goingRight) {
        node.applyForce({ x: 0.1, y: 0 });
        console.log('accelerating');
    } else {
        node.applyForce({ x: -0.1, y: 0 });
        console.log('braking');
    }

    if (momentum > 3) {
        goingRight = false;
    }
    node.update();
    node.render();

}, 1000 / 60); // 60 fps



function getVectorLen({ x, y }) {
    const sqr = num => num * num
    const { sqrt } = Math;

    return sqrt(sqr(x) + sqr(y));
}
