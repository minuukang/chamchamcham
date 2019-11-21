import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ChamChamCham from "./modules/chamchamcham";

ChamChamCham.loadModel().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
