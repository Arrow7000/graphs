import range from "lodash/range";
import P from "./graphs/Point";
import Vertex from "./graphs/Vertex";
import VertexCollection from "./graphs/VertexCollection";
import Edge from "./graphs/Edge";
import EdgeCollection from "./graphs/EdgeCollection";

const { random } = Math;

const nodesWindow = 300;

function initNetwork(defaultSize = 100) {
  const widthProp = defaultSize;
  const heightProp = defaultSize;
  const centerPoint = new P(widthProp / 1, heightProp / 2);

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

  return { vertices, edges };
}

export default initNetwork;
