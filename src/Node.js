const damping = 0.1;
const mass = 1;


class Node {
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
        const { x, y } = this.velocity;
        console.log('velocity', { x, y });
        this.position.x += x;
        this.position.y += y;
        console.log('position', this.position);
    }

    // accelerate(x, y) {
    //     this.velocity.x += x;
    //     this.velocity.y += y;
    // }

    applyForce(vector) {
        const { x, y } = vector;
        this.velocity.x += x / this.mass;
        this.velocity.y += y / this.mass;

    }

    render() {
        console.log(this.position);
    }
}

export default Node;
