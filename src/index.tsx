import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "bulma/css/bulma.css";
import "./style.scss";

import initNetwork from "./initNetwork";

const network = initNetwork();

const root = document.getElementById("root");
ReactDOM.render(<App network={network} />, root);
