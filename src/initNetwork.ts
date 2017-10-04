import range from "lodash/range";
import P from "./graphs/Point";
import Vertex from "./graphs/Vertex";
import VertexCollection from "./graphs/VertexCollection";
import Edge from "./graphs/Edge";
import EdgeCollection from "./graphs/EdgeCollection";

const { random } = Math;

const defaultSize = 100;

function initNetwork() {
  // Closures
  let centerPoint = new P();
  let widthProp = 0;
  let heightProp = 0;

  // closure getters
  const getCenter = () => centerPoint;
  const getWidth = () => widthProp;
  const getHeight = () => heightProp;

  // reassign closures
  function canvasResize(
    canvas?: HTMLCanvasElement | null,
    ctx?: CanvasRenderingContext2D | null
  ) {
    // console.log("resizing");
    if (!canvas || !ctx) {
      // debugger;
    }
    widthProp = canvas ? canvas.offsetWidth : defaultSize;
    heightProp = canvas ? canvas.offsetHeight : defaultSize;
    centerPoint = new P(widthProp / 2, heightProp / 2);

    if (ctx) {
      ctx.canvas.width = widthProp;
      ctx.canvas.height = heightProp;
    }
  }

  canvasResize();

  const nodesWindow = 300;

  const vertices = new VertexCollection(
    range(13).map(() => {
      return new Vertex(
        getCenter().add(random() * nodesWindow - nodesWindow / 2)
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
    edges,
    canvasResize,
    getCenter,
    getWidth,
    getHeight
  };
}

export default initNetwork;
