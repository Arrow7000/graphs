import React, { Component } from "react";
import Dashboard from "./Dashboard";
import Canvas from "./Canvas";

class App extends Component {
  render() {
    return (
      <div className="grid-container">
        <Dashboard />
        <Canvas />
      </div>
    );
  }
}

export default App;
