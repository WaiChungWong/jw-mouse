# jw-mouse

An instance class which hooks into all mouse and touch events.
It also captures position, direction and speed of movement.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/jw-mouse.svg
[npm-url]: http://npmjs.org/package/jw-mouse
[travis-image]: https://img.shields.io/travis/WaiChungWong/jw-mouse.svg
[travis-url]: https://travis-ci.org/WaiChungWong/jw-mouse
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/jw-mouse.svg
[download-url]: https://npmjs.org/package/jw-mouse

## install

[![NPM](https://nodei.co/npm/jw-mouse.png)](https://nodei.co/npm/jw-mouse)

## Usage

```javascript
import Mouse from "jw-mouse";

/* Get the container for the mouse. */
var container = document.getElementById("container");

/* Create a mouse instance, with the element as its container.
 * This is to allow the mouse to monitor all mouse events from the container. */
var mouse = new Mouse(container);

/** Append the mouse to the a DOM element and event functions to it. */
mouse.attach(container);

/** Disengage the mouse from DOM element and event functions from it. */
mouse.detach();

/** Toggle value for mouse prevent default on all events. */
mouse.setPreventDefault(preventDefault);

let mouseOverHandler = event => { ... };

/** Bind an event handler to the mouse over event. */
mouse.onMouseOver(mouseOverHandler);

/** Unbind an event handler to the mouse over event. */
mouse.removeMouseOver(mouseOverHandler);

/** Unbind all event handlers from the mouse over event. */
mouse.clearMouseOver();

let mouseOutHandler = event => { ... };

/** Bind an event handler to the mouse out event. */
mouse.onMouseOut(mouseOutHandler);

/** Unbind an event handler to the mouse out event. */
mouse.removeMouseOut(mouseOutHandler);

/** Unbind all event handlers from the mouse out event. */
mouse.clearMouseOut();

let mouseDownHandler = event => { ... };

/** Bind an event handler to the mouse down event. */
mouse.onMouseDown(mouseDownHandler);

/** Unbind an event handler to the mouse down event. */
mouse.removeMouseDown(mouseDownHandler);

/** Unbind all event handlers from the mouse down event. */
mouse.clearMouseDown();

let mouseUpHandler = event => { ... };

/** Bind an event handler to the mouse up event. */
mouse.onMouseUp(mouseUpHandler);

/** Unbind an event handler to the mouse up event. */
mouse.removeMouseUp(mouseUpHandler);

/** Unbind all event handlers from the mouse up event. */
mouse.clearMouseUp();

let mouseMoveHandler = event => { ... };

/** Bind an event handler to the mouse move event. */
mouse.onMouseMove(mouseMoveHandler);

/** Unbind an event handler to the mouse move event. */
mouse.removeMouseMove(mouseMoveHandler);

/** Unbind all event handlers from the mouse move event. */
mouse.clearMouseMove();

let mouseScrollHandler = event => { ... };

/** Bind an event handler to the scroll event. */
mouse.onScroll(mouseScrollHandler);

/** Unbind an event handler to the scroll event. */
mouse.removeScroll(mouseScrollHandler);

/** Unbind all event handlers from the mouse scroll event. */
mouse.clearScroll();

let dragHandler = event => { ... };

/** Bind an event handler to the drag event. */
mouse.onDrag(dragHandler);

/** Unbind an event handler to the drag event. */
mouse.removeDrag(dragHandler);

/** Unbind all event handlers from the mouse drag event. */
mouse.clearDrag();

let dragOverHandler = event => { ... };

/** Bind an event handler to the drag over event. */
mouse.onDragOver(dragOverHandler);

/** Unbind an event handler to the drag over event. */
mouse.removeDragOver(dragOverHandler);

/** Unbind all event handlers from the drag over event. */
mouse.clearDragOver();

let dropHandler = event => { ... };

/** Bind an event handler to the drop event. */
mouse.onDrop(dropHandler);

/** Unbind an event handler to the drop event. */
mouse.removeDrop(dropHandler);

/** Unbind all event handlers from the drop event. */
mouse.clearDrop();

let stopHandler = event => { ... };

/** Bind all event handlers from the stop event. */
mouse.onStop(stopHandler);

/** Unbind an event handler to the stop event. */
mouse.removeStop(stopHandler);

/** Unbind all event handlers from the stop event. */
mouse.clearStop();

let clickHandler = event => { ... };

/** Bind all event handlers from the click event. */
mouse.onClick(clickHandler);

/** Unbind an event handler to the click event. */
mouse.removeClick(clickHandler);

/** Unbind all event handlers from the click event. */
mouse.clearClick();
```
