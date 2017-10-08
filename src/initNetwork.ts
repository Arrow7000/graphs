import range from "lodash/range";
import P from "./graphs/Point";
import Vertex from "./graphs/Vertex";
import VertexCollection from "./graphs/VertexCollection";
import Edge from "./graphs/Edge";
import EdgeCollection from "./graphs/EdgeCollection";

const { random } = Math;

// const defaultSize = 100;
const nodesWindow = 300;

function initNetwork(defaultSize = 100) {
  // Closures
  let widthProp = defaultSize;
  let heightProp = defaultSize;
  let centerPoint = new P(widthProp / 1, heightProp / 2);

  // // closure getters
  // const getCenter = () => centerPoint;
  // const getWidth = () => widthProp;
  // const getHeight = () => heightProp;

  // reassign closures
  // function canvasResize(canvas?: HTMLCanvasElement | null) {
  //   // console.log("resizing");

  //   widthProp = canvas ? canvas.offsetWidth : defaultSize;
  //   heightProp = canvas ? canvas.offsetHeight : defaultSize;
  //   centerPoint = new P(widthProp / 2, heightProp / 2);

  //   // if (ctx) {
  //   //   // This sets canvas pixel properties, so needs to be set somewhere
  //   //   ctx.canvas.width = widthProp;
  //   //   ctx.canvas.height = heightProp;
  //   // }
  // }

  // canvasResize();

  const vertices = new VertexCollection(
    range(13).map(() => {
      return new Vertex(
        centerPoint.add(random() * nodesWindow - nodesWindow / 2)
      );
    })
  );

  const edgeArray = range(30)
    .map(() => {
      const vertexA = vertices.getRandom();
      const vertexB = vertices.getRandom();
      if (vertexA !== vertexB) {
        return new Edge(vertexA, vertexB);
      }
      return null;
    })
    .filter(item => item !== null);

  const edges = new EdgeCollection(<Edge[]>edgeArray);

  return {
    vertices,
    edges
    // canvasResize,
    // getCenter,
    // getWidth,
    // getHeight
  };
}

export default initNetwork;
