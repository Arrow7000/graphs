import { damping, mass } from './config';


class Vertex {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };

        this.mass = mass;
    }

    getMomentum() {
        const { x, y } = this.velocity;
        return {
            x: x * this.mass,
            y: y * this.mass,
        };
    }

    update() {
        // actual movement happens here
        // The rest is commentary
        this.velocity.x *= 1 - damping;
        this.velocity.y *= 1 - damping;

        const { x, y } = this.velocity;
        this.position.x += x;
        this.position.y += y;
    }

    applyForce({ x, y }) {
        this.velocity.x += x / this.mass;
        this.velocity.y += y / this.mass;

    }

    render(ctx) {
        // draws directly onto canvas
        const { x, y } = this.position;

        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default Vertex;
