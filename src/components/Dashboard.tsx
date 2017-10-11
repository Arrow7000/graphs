import React, { Component } from "react";
import Network from "../graphs/Network";

interface StyleObj {
  display?: string;
}

class Dashboard extends Component<
  {
    network: Network;
    load: () => void;
  },
  { collapsed: boolean }
> {
  constructor() {
    super();
    this.state = { collapsed: true };

    this.toggleCollapsed = this.toggleCollapsed.bind(this);
  }

  toggleCollapsed() {
    this.setState(state => {
      const { collapsed } = state;
      return { collapsed: !collapsed };
    });
  }

  render() {
    const { load, network } = this.props;
    const { edges, vertices } = network;
    const { collapsed } = this.state;

    const style: StyleObj = {};
    if (collapsed) {
      style.display = collapsed ? "none" : "initial";
    }

    return (
      <div className="dashboard">
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">Dashboard</p>
            <a
              onClick={this.toggleCollapsed}
              className="card-header-icon"
              aria-label="more options"
            >
              <span className="icon">
                <i
                  className={`fa fa-angle-${collapsed ? "down" : "up"}`}
                  aria-hidden="true"
                />
              </span>
            </a>
          </header>
          <div>
            <div className="card-content" style={style}>
              <div className="content">
                <h4>Current network</h4>
                <p>{vertices.length} vertices</p>
                <p>{edges.length} edges</p>
              </div>
            </div>
            <footer className="card-footer" style={style}>
              <a href="#" className="card-footer-item">
                Save graph
              </a>
              <a className="card-footer-item" onClick={() => load()}>
                Load graph
              </a>
              <a href="#" className="card-footer-item">
                Other thing
              </a>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
