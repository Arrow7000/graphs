import range from "lodash/range";
import P from "./graphs/Point";
import Vertex from "./graphs/Vertex";
import VertexCollection from "./graphs/VertexCollection";
import Edge from "./graphs/Edge";
import EdgeCollection from "./graphs/EdgeCollection";

const { random } = Math;

function initNetwork(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  // Closures
  let centerPoint = new P();
  let widthProp = 0;
  let heightProp = 0;

  // closure getters
  const getCenter = () => centerPoint;
  const getWidth = () => widthProp;
  const getHeight = () => heightProp;

  // reassign closures
  function canvasResize() {
    console.log("resizing");

    widthProp = canvas.offsetWidth;
    heightProp = canvas.offsetHeight;
    centerPoint = new P(widthProp / 2, heightProp / 2);

    ctx.canvas.width = widthProp;
    ctx.canvas.height = heightProp;
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

  const network = { vertices, edges };

  return network;
}

export default initNetwork;
