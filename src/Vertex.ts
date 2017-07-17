import P, { random, floor, addVec, multiplyVec } from './Point';
// import { random, floor, addVec, multiplyVec, divideVec } from './vectorMaths';
import { damping, vertexMass, vertexRadius, vertexCharge, nodeBodyColour, edgeColour } from './config';

const uuidChunk = () => floor(random() * 1000000);
const uuid = () => '' + uuidChunk() + '-' + uuidChunk() + '-' + uuidChunk();

class Vertex {

    id: string;
    position: P;
    velocity: P;
    mass: number;
    charge: number;
    dragging: boolean;
    text: string;


    constructor(x: number, y: number);
    constructor(point: P);
    constructor();
    constructor(xOrPoint?: P | number, yCoord?: number) {
        this.id = uuid();

        this.position = xOrPoint !== undefined ? (
            yCoord !== undefined ?
                new P(<number>xOrPoint, yCoord) : new P(<P>xOrPoint)
        ) : new P();

        this.velocity = new P();

        this.mass = vertexMass;
        this.charge = vertexCharge;

        this.dragging = false;
    }

    getMomentum() {
        return this.velocity.multiply(this.mass);
    }

    update() {
        if (!this.dragging) {
            // actual movement happens here
            // The rest is commentary
            this.velocity = this.velocity.multiply(1 - damping);
            // console.log(this.velocity);
            this.position = this.position.add(this.velocity);
            // console.log(this.position);
        }
    }

    applyForce(vector: P) {
        if (!this.dragging) {
            this.velocity = this.velocity.add(vector.divide(this.mass));
        }
    }

    // applies movement directly without applying force - used mainly for centering
    applyMovement(vector: P) {
        if (!this.dragging) {
            this.position = this.position.add(vector);
        }
    }

    drag(position: P) {
        this.position = position;
    }

    setText(text: string) {
        this.text = text;
    }

    render(ctx: CanvasRenderingContext2D) {
        // draws directly onto canvas
        const { x, y } = this.position;

        ctx.beginPath();
        ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
        ctx.fillStyle = nodeBodyColour;
        ctx.fill();

        ctx.lineWidth = 5;
        ctx.strokeStyle = edgeColour;
        ctx.stroke();

        if (this.text) {
            ctx.textBaseline = 'middle';
            ctx.fillStyle = edgeColour;
            ctx.fillText(this.text, x + 10 + vertexRadius, y);
        }
    }
}

export default Vertex;
