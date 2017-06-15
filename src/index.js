import Circle from './Circle';


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = 1000 / 60;




let lastUpdate = new Date();

const node = new Circle(500, 500);

let goingRight = true;

function update() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);






    const momentum = getVectorLen(node.getMomentum());
    if (goingRight) {
        node.applyForce({ x: 0.1, y: 0 });
        // console.log('accelerating');
    } else {
        node.applyForce({ x: -0.1, y: 0 });
        // console.log('braking');
    }

    if (momentum > 10) {
        goingRight = false;
    }
    node.update();
    node.render(ctx);




    const now = +new Date();
    const msTillNextFrame = (lastUpdate + frame) - now;
    const timeTillUpdate = msTillNextFrame > 0 ? msTillNextFrame : 0;

    lastUpdate = now;
    setTimeout(() => {
        update();
    }, timeTillUpdate);
}

update();



function getVectorLen({ x, y }) {
    const sqr = num => num * num
    const { sqrt } = Math;

    return sqrt(sqr(x) + sqr(y));
}
