import React, { Component } from "react";

import Vertex from "./graphs/Vertex";
import VertexCollection from "./graphs/VertexCollection";
import Edge from "./graphs/Edge";
import EdgeCollection from "./graphs/EdgeCollection";

class Dashboard extends Component<
  {
    edges: EdgeCollection;
    vertices: VertexCollection;
  },
  {}
> {
  render() {
    const { edges, vertices } = this.props;

    return (
      <div className="dashboard">
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">Dashboard</p>
          </header>
          <div className="card-content">
            <div className="content">
              <h4>Current network</h4>
              <p>{edges.length} edges</p>
              <p>{vertices.length} vertices</p>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">
              Save graph
            </a>
            <a href="#" className="card-footer-item">
              Load graph
            </a>
            <a href="#" className="card-footer-item">
              Other thing
            </a>
          </footer>
        </div>
      </div>
    );
  }
}

export default Dashboard;
