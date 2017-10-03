import React, { Component } from "react";
import Dashboard from "./Dashboard";
import Canvas, { Network } from "./Canvas";

interface Props {
  network: Network;
}

class App extends Component<Props, {}> {
  render() {
    const { network } = this.props;
    const { vertices, edges } = network;

    return (
      <div className="grid-container">
        <Dashboard vertices={vertices} edges={edges} />
        <Canvas network={network} />
      </div>
    );
  }
}

export default App;
