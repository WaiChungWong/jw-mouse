import React, { Component } from "react";
import { render } from "react-dom";

import Mouse from "./module";

import "./style.css";

class Demo extends Component {
  constructor(props) {
    super(props);

    this.mouse = new Mouse();

    this.state = { direction: 0, movingSpeed: 0 };
  }

  _updateMouse(mouse) {
    const { position, direction, movingSpeed } = mouse;
    this.setState({ position, direction, movingSpeed });
  }

  componentDidMount() {
    this.mouse.attach(this.demo);

    this.mouse.onMove(e => this._updateMouse(e.mouse));
    this.mouse.onStop(e => this._updateMouse(e.mouse));
    this.mouse.onLeave(() => this.setState({ x: 0, y: 0, movingSpeed: 0 }));
  }

  componentWillUnmount() {
    this.mouse.detach();
  }

  render() {
    const { position, direction, movingSpeed } = this.state;

    return (
      <div ref={d => (this.demo = d)} id="demo">
        <div id="status">
          <div className="title">Mouse details</div>
          <div className="position">
            position (x, y):
            {position && (
              <span>
                {position.x}, {position.y}
              </span>
            )}
          </div>
          <div className="direction">
            direction (rad):
            {position && <span>{direction.toFixed(2)}</span>}
          </div>
          <div>
            moving speed (pi/s):
            {position && <span>{movingSpeed.toFixed(2)}</span>}
          </div>
        </div>
        {position && (
          <div
            id="mouse"
            style={{
              top: position.y,
              left: position.x
            }}
          >
            <span
              style={{
                transform: `translateY(-50%) rotate(${direction}rad) scale(${1 +
                  movingSpeed / 200}, ${1 + movingSpeed / 400})`
              }}
            >
              →
            </span>
          </div>
        )}
      </div>
    );
  }
}

render(<Demo />, document.getElementById("root"));
