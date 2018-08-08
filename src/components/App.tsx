import React, { Component } from "react";
// import Konva from "konva";
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import Dashboard from "./Dashboard";
import Canvas, { EventHandlers } from "./Canvas";
import each from "lodash/each";
import Network from "../graphs/Network";
import Vertex from "../graphs/Vertex";
import P from "../vectors/Point";
import {
  layoutPreRender,
  Updater,
  storeNetwork,
  getNetwork
} from "../graphs/helpers";
import {
  applyElectrostatic,
  applySpring,
  applyCenterMovement
  // boxForce
} from "../graphs/forces";
import Edge from "../graphs/Edge";

const { random, round } = Math;

const diag = 1200;

function VertexRender({ vertex }: { vertex: Vertex }) {
  const dragger = e => {
    console.log(e.target);
    vertex.drag(new P(e.target.x(), e.target.y()));
  };

  const dragStart = e => {
    vertex.dragging = true;
    dragger(e);
  };

  const dragEnd = e => {
    dragger(e);
    vertex.dragging = false;
  };

  return (
    <Circle
      radius={50}
      fill="#446CB3"
      strokeWidth={15}
      x={vertex.position.x}
      y={vertex.position.y}
      draggable
      onDragStart={dragStart}
      onDragMove={dragger}
      onDragEnd={dragEnd}
    />
  );
}

const getRandCoord = () => {
  const vertex = {
    x: Math.random() * diag,
    y: Math.random() * diag
  };

  return vertex;
};
const getRandCoords = () => new Array(10).fill(null).map(getRandCoord);

const vertices = getRandCoords();

let network = new Network();
const v1 = new Vertex();
const v2 = new Vertex(2000, 2000);
const v3 = new Vertex(0, 13);
network.pushVertex(v1);
network.pushVertex(v2);
network.pushVertex(v3);
const e1 = new Edge(v1, v2);
const e2 = new Edge(v1, v3);
network.pushEdge(e1);
network.pushEdge(e2);

function reassignNetwork(newNetwork: Network) {
  // network = networkCollection;
  const { vertices, edges } = network;
  vertices.replace(newNetwork.vertices.toArray());
  edges.replace(newNetwork.edges.toArray());
}

function update(visible = true) {
  // `visible` param controls whether render method gets called
  const { vertices, edges } = network;
  // console.log(
  //   "applying forces",
  //   network.vertices.toArray(),
  //   network.edges.toArray()
  // );
  applyElectrostatic(vertices.toArray());
  applySpring(edges.toArray());
  // applyCenterMovement(vertices.toArray(), center);
  // boxForce(vertices.toArray(), new P(), new P(getWidth(), getHeight()));

  each(vertices.toArray(), vertex => {
    const { x, y } = vertex.position;
    vertex.setText(`(${round(x)}, ${round(y)})`);
    vertex.update();
  });
}

let i = 0;
const cancelUpdater = Updater(() => {
  // console.log("hello", i++);
  update();
});

class App extends Component {
  componentDidMount() {
    network.onChange(() => {
      console.log("updating");
      this.forceUpdate();
    });

    setInterval(() => {
      this.forceUpdate();
    }, 1000 / 60);

    // // Restore last saved network
    // const storedNetwork = getNetwork();
    // console.log(storedNetwork);
    // if (storedNetwork) {
    //   reassignNetwork(storedNetwork.vertices, storedNetwork.edges);
    // }
  }

  componentWillUnmount() {
    cancelUpdater();
  }

  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {network.edges.toArray().map((edge, i) => {
            if (edge.to) {
              return (
                <Line
                  key={i}
                  strokeWidth={2}
                  stroke="#446CB3"
                  points={[
                    edge.from.position.x,
                    edge.from.position.y,
                    edge.to.position.x,
                    edge.to.position.y
                  ]}
                />
              );
            } else {
              return null;
            }
          })}
          {network.vertices.toArray().map((vertex, i) => (
            <VertexRender key={i} vertex={vertex} />
          ))}
        </Layer>
      </Stage>
    );
  }
}

export default App;

// import {
//   applyElectrostatic,
//   applySpring,
//   applyCenterMovement
//   // boxForce
// } from "../graphs/forces";
// import {
//   layoutPreRender,
//   Updater,
//   storeNetwork,
//   getNetwork
// } from "../graphs/helpers";
// import handlersFactory from "../graphs/touchHandlers";
// import VertexCreator from "../graphs/VertexCreator";
// import P from "../vectors/Point";
// import {
//   vertexRadius,
//   backgroundColour,
//   maxPrerenderTime,
//   maxAvgMomentumLen
// } from "../graphs/config";
// import VertexCollection from "../graphs/VertexCollection";
// import EdgeCollection from "../graphs/EdgeCollection";
// import Network from "../graphs/Network";

// const defaultSize = 100;
// const vertexCreatorMargin = 100;

// let network = new Network();

// function reassignNetwork(newNetwork: Network) {
//   // network = networkCollection;
//   const { vertices, edges } = network;
//   vertices.replace(newNetwork.vertices.toArray());
//   edges.replace(newNetwork.edges.toArray());
// }

// const vertexCreator = new VertexCreator(); // @TODO: put it in right bottom corner

// const { random, round } = Math;

// class App extends Component {
//   ctx: CanvasRenderingContext2D | null;

//   width: number;
//   height: number;
//   center: P;

//   touchStart: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
//   touchMove: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
//   touchEnd: (event: TouchEvent, canvas: HTMLCanvasElement) => void;
//   mouseStart: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
//   mouseMove: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
//   mouseEnd: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
//   doubleClick: (event: MouseEvent, canvas: HTMLCanvasElement) => void;

//   constructor() {
//     super();

//     this.ctx = null;

//     const {
//       touchStart,
//       touchMove,
//       touchEnd,
//       mouseStart,
//       mouseMove,
//       mouseEnd,
//       doubleClick
//     } = handlersFactory(network, vertexCreator);

//     this.touchStart = touchStart.bind(this);
//     this.touchMove = touchMove.bind(this);
//     this.touchEnd = touchEnd.bind(this);
//     this.mouseStart = mouseStart.bind(this);
//     this.mouseMove = mouseMove.bind(this);
//     this.mouseEnd = mouseEnd.bind(this);
//     this.doubleClick = doubleClick.bind(this);

//     this.setSize = this.setSize.bind(this);
//     this.setCtx = this.setCtx.bind(this);
//     this.ctxSet = this.ctxSet.bind(this);
//     this.update = this.update.bind(this);
//     this.forceUpdate = this.forceUpdate.bind(this);

//     this.setSize(defaultSize, defaultSize);

//     this.loadSavedNetwork = this.loadSavedNetwork.bind(this);
//   }

//   componentDidMount() {
//     network.onChange(this.forceUpdate);

//     // // Restore last saved network
//     // const storedNetwork = getNetwork();
//     // console.log(storedNetwork);
//     // if (storedNetwork) {
//     //   reassignNetwork(storedNetwork.vertices, storedNetwork.edges);
//     // }
//   }

//   setSize(width: number, height: number) {
//     this.width = width;
//     this.height = height;
//     this.center = new P(width / 2, height / 2);

//     vertexCreator.changePosition(
//       new P(width - vertexCreatorMargin, height - vertexCreatorMargin)
//     );

//     // storeNetwork(vertices.toArray(), edges.toArray());
//   }

//   ctxSet(width: number, height: number) {
//     const { ctx, update } = this;

//     this.setSize(width, height);

//     if (ctx) {
//       this.prerender();

//       Updater(width, height, ctx, update);
//     }
//   }

//   setCtx(ctx: CanvasRenderingContext2D, width: number, height: number) {
//     this.ctx = ctx;

//     this.ctxSet(width, height);
//   }

//   update(visible = true) {
//     // `visible` param controls whether render method gets called
//     const { ctx, width, height, center } = this;
//     const { vertices, edges } = network;
//     if (ctx) {
//       ctx.beginPath();
//       ctx.fillStyle = backgroundColour;
//       ctx.fillRect(0, 0, width, height);

//       applyElectrostatic(vertices.toArray());
//       applySpring(edges.toArray());
//       applyCenterMovement(vertices.toArray(), center);
//       // boxForce(vertices.toArray(), new P(), new P(getWidth(), getHeight()));

//       each(edges.toArray(), edge => edge.render(ctx));

//       each(vertices.toArray(), vertex => {
//         const { x, y } = vertex.position;
//         vertex.setText(`(${round(x)}, ${round(y)})`);
//         vertex.update();
//         if (visible) {
//           vertex.render(ctx);
//         }
//       });

//       if (visible) {
//         vertexCreator.render(ctx);
//       }
//     }
//   }

//   prerender() {
//     const { update } = this;
//     layoutPreRender(
//       network.vertices.toArray(),
//       update,
//       maxPrerenderTime,
//       maxAvgMomentumLen
//     );
//   }

//   loadSavedNetwork() {
//     const storedNetwork = getNetwork();
//     console.log(storedNetwork);
//     if (storedNetwork) {
//       reassignNetwork(storedNetwork);
//       this.prerender();
//     }
//   }

//   render() {
//     const {
//       touchStart,
//       touchMove,
//       touchEnd,
//       mouseStart,
//       mouseMove,
//       mouseEnd,
//       doubleClick
//     } = this;

//     return (
//       <div className="grid-container">
//         <Dashboard network={network} load={this.loadSavedNetwork} />
//         {/* <Canvas
//           onResize={this.setSize}
//           setCtx={this.setCtx}
//           touchStart={touchStart}
//           touchMove={touchMove}
//           touchEnd={touchEnd}
//           touchCancel={touchEnd}
//           mouseDown={mouseStart}
//           mouseMove={mouseMove}
//           mouseUp={mouseEnd}
//           mouseLeave={mouseEnd}
//           doubleClick={doubleClick}
//         /> */}
//         <Stage width={window.innerWidth} height={window.innerHeight}>
//           <Text text="Try click on rect" />
//         </Stage>
//       </div>
//     );
//   }
// }
