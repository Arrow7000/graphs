import Edge from "./Edge";
import map from "lodash/map";

class EdgeCollection {
  private edges: { [id: string]: Edge };

  constructor(edges?: Edge[]) {
    this.edges = {};

    if (edges) {
      for (const edge of edges) {
        const { id } = edge;
        this.edges[id] = edge;
      }
    }
  }

  push(edge: Edge) {
    const { id } = edge;
    this.edges[id] = edge;
  }

  delete(edge: Edge);
  delete(edgeId: string);
  delete(edgeOrId: Edge | string) {
    const id = edgeOrId instanceof Edge ? edgeOrId.id : edgeOrId;

    delete this.edges[id];
  }

  toArray() {
    const array = map(this.edges, edge => edge);
    return array;
  }
}

export default EdgeCollection;
