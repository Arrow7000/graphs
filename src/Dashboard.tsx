import React, { Component } from "react";

class Dashboard extends Component {
  render() {
    return (
      <div className="dashboard">
        <div className="card">
          <header className="card-header">
            <p className="card-header-title">Dashboard</p>
          </header>
          <div className="card-content">
            <div className="content">Stuff goes in here</div>
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
