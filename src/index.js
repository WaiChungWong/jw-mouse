import React, { Component } from "react";
import { render } from "react-dom";

import Mouse from "./module";

import "./style.css";

const { sin, cos } = Math;

class Demo extends Component {
  constructor(props) {
    super(props);

    this.mouse = new Mouse();

    this.state = { x: 0, y: 0, direction: 0, movingSpeed: 0 };
  }

  _updateMouse(mouse) {
    const { position, direction, movingSpeed } = mouse;
    const { x, y } = position;

    this.setState({ x, y, direction, movingSpeed });
  }

  componentDidMount() {
    this.mouse.attach(this.demo);

    this.mouse.onMove(e => this._updateMouse(e.mouse));
    this.mouse.onStop(e => this._updateMouse(e.mouse));
  }

  componentWillUnmount() {
    this.mouse.detach();
  }

  render() {
    const { x, y, direction, movingSpeed } = this.state;
    const futureX = x + cos(direction) * movingSpeed / 5;
    const futureY = y + sin(direction) * movingSpeed / 5;

    return (
      <div ref={d => (this.demo = d)} id="demo">
        <div id="stats">
          <div>x: {x}</div>
          <div>y: {y}</div>
          <div>direction: {direction}</div>
          <div>moving speed: {movingSpeed}</div>
        </div>
        <div
          id="mouse"
          style={{
            top: y,
            left: x
          }}
        />
        <div
          id="future-mouse"
          style={{
            top: futureY,
            left: futureX,
            transform: `scale(${1 + movingSpeed / 500})`
          }}
        />
      </div>
    );
  }
}

render(<Demo />, document.getElementById("root"));
