import React from "react";
import ReactDOM from "react-dom";
import Map from "./Map";
import "mapbox-gl/dist/mapbox-gl.css";

const Application = () => {
  return (
    <>
      <Map />
    </>
  );
};

ReactDOM.render(<Application />, document.getElementById("app"));
