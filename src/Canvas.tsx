import React, { Component } from "react";

import VertexCollection from "./graphs/VertexCollection";
import EdgeCollection from "./graphs/EdgeCollection";

export interface Network {
  vertices: VertexCollection;
  edges: EdgeCollection;
}

interface Props {
  network: Network;
}

class App extends Component<Props> {
  render() {
    return (
      <canvas className="canvas">
        Please update to a modern browser that supports canvas.
      </canvas>
    );
  }
}

export default App;
