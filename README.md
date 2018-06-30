# jw-mouse

An instance class which hooks into all mouse and touch events.
It also captures position, direction and speed of movement.
(Currently it supports single touch only)

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

[Demo](http://waichungwong.github.io/jw-mouse/build)

## Install

[![NPM](https://nodei.co/npm/jw-mouse.png)](https://nodei.co/npm/jw-mouse)

## Methods

| Method              | Parameters                | Description                                                                     |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `attach`            | `element`: DOM element    | append the mouse to the a DOM element and event functions to it.                |
| `detach`            |                           | disengage the mouse from DOM element and event functions from it.               |
| `setPreventDefault` | `preventDefault`: boolean | toggle value for mouse prevent default on all events.                           |
| `onEnter`           | `handler`: function       | bind an event handler to the mouse enter event. Returns a method to unbind.     |
| `clearEnter`        |                           | unbind all event handlers from the mouse enter event.                           |
| `onLeave`           | `handler`: function       | bind an event handler to the mouse leave event. Returns a method to unbind.     |
| `clearLeave`        |                           | unbind all event handlers from the mouse leave event.                           |
| `onDown`            | `handler`: function       | bind an event handler to the mouse down event. Returns a method to unbind.      |
| `clearDown`         |                           | unbind all event handlers from the mouse down event.                            |
| `onUp`              | `handler`: function       | bind an event handler to the mouse up event. Returns a method to unbind.        |
| `clearUp`           |                           | unbind all event handlers from the mouse up event.                              |
| `onMove`            | `handler`: function       | bind an event handler to the mouse move event. Returns a method to unbind.      |
| `clearMove`         |                           | unbind all event handlers from the mouse move event.                            |
| `onScroll`          | `handler`: function       | bind an event handler to the mouse scroll event. Returns a method to unbind.    |
| `clearScroll`       |                           | unbind all event handlers from the mouse scroll event.                          |
| `onDrag`            | `handler`: function       | bind an event handler to the mouse drag event. Returns a method to unbind.      |
| `clearDrag`         |                           | unbind all event handlers from the mouse drag event.                            |
| `onDragOver`        | `handler`: function       | bind an event handler to the mouse drag over event. Returns a method to unbind. |
| `clearDragOver`     |                           | unbind all event handlers from the mouse drag over event.                       |
| `onDrop`            | `handler`: function       | bind an event handler to the mouse drop event. Returns a method to unbind.      |
| `clearDrop`         |                           | unbind all event handlers from the mouse drop event.                            |
| `onStop`            | `handler`: function       | bind an event handler to the mouse stop event. Returns a method to unbind.      |
| `clearStop`         |                           | unbind all event handlers from the mouse stop event.                            |
| `onClick`           | `handler`: function       | bind an event handler to the mouse click event. Returns a method to unbind.     |
| `clearClick`        |                           | unbind all event handlers from the mouse click event.                           |

## Handler Event

On handling the event, the same event object as the one from `addEventListener` will be passed as a parameter, with an additional `mouse` object, which holds the following properties:

| Prop                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `isMouseDown`          | whether any mouse key is pressed down.                                  |
| `scrollDelta`          | the delta value when the mouse scrolls.                                 |
| `isTouching`           | whether the mouse is currently contacted by touch surface.              |
| `previousPosition`     | previous mouse position.                                                |
| `previousDownPosition` | previous mouse position when a mouse button was pressed.                |
| `position`             | current mouse position.                                                 |
| `direction`            | current mouse direction.                                                |
| `movedDistance`        | the distance moved from previous position.                              |
| `movingSpeed`          | current mouse moving speed.                                             |
| `preventDefault`       | whether the mouse skips the default behaviours upon the listen element. |

## Usage

```javascript
import Mouse from "jw-mouse";

/* Get the element for the mouse. */
var element = document.getElementById("container");

/* Create a mouse instance, with the element as its container.
 * This is to allow the mouse to monitor all mouse events from the container. */
var mouse = new Mouse(element);

/** Append the mouse to the a DOM element and event functions to it. */
mouse.attach(element);

/** Disengage the mouse from DOM element and event functions from it. */
mouse.detach();

/** Toggle value for mouse prevent default on all events. */
mouse.setPreventDefault(preventDefault);

/** Bind an event handler to the mouse enter event. */
let removeEnter = mouse.onEnter(event => { ... });

/** Unbind an event handler to the mouse enter event. */
removeEnter();

/** Unbind all event handlers from the mouse enter event. */
mouse.clearEnter();

/** Bind an event handler to the mouse leave event. */
let removeLeave = mouse.onLeave(event => { ... });

/** Unbind an event handler to the mouse leave event. */
removeLeave();

/** Unbind all event handlers from the mouse leave event. */
mouse.clearLeave();

/** Bind an event handler to the mouse down event. */
let removeDown = mouse.onDown(event => { ... });

/** Unbind an event handler to the mouse down event. */
removeDown();

/** Unbind all event handlers from the mouse down event. */
mouse.clearDown();

/** Bind an event handler to the mouse up event. */
let removeUp = mouse.onUp(event => { ... });

/** Unbind an event handler to the mouse up event. */
removeUp();

/** Unbind all event handlers from the mouse up event. */
mouse.clearUp();

/** Bind an event handler to the mouse move event. */
let removeMove = mouse.onMove(event => { ... });

/** Unbind an event handler to the mouse move event. */
removeMove();

/** Unbind all event handlers from the mouse move event. */
mouse.clearMove();

/** Bind an event handler to the scroll event. */
let removeScroll = mouse.onScroll(event => { ... });

/** Unbind an event handler to the scroll event. */
removeScroll();

/** Unbind all event handlers from the mouse scroll event. */
mouse.clearScroll();

/** Bind an event handler to the drag event. */
let removeDrag = mouse.onDrag(event => { ... });

/** Unbind an event handler to the drag event. */
removeDrag();

/** Unbind all event handlers from the mouse drag event. */
mouse.clearDrag();

/** Bind an event handler to the drag over event. */
let removeDragOver = mouse.onDragOver(event => { ... });

/** Unbind an event handler to the drag over event. */
removeDragOver();

/** Unbind all event handlers from the drag over event. */
mouse.clearDragOver();

/** Bind an event handler to the drop event. */
let removeDrop = mouse.onDrop(event => { ... });

/** Unbind an event handler to the drop event. */
removeDrop();

/** Unbind all event handlers from the drop event. */
mouse.clearDrop();

/** Bind all event handlers from the stop event. */
let removeStop = mouse.onStop(event => { ... });

/** Unbind an event handler to the stop event. */
removeStop();

/** Unbind all event handlers from the stop event. */
mouse.clearStop();

/** Bind all event handlers from the click event. */
let removeClick = mouse.onClick(event => { ... });

/** Unbind an event handler to the click event. */
removeClick();

/** Unbind all event handlers from the click event. */
mouse.clearClick();
```
