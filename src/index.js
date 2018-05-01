const { min, max, sqrt, atan2 } = Math;

/** Calculate the distance from the origin position to the destination position. */
const getDistanceVector = (position1, position2) => {
  if (position1 && position2) {
    let { x: x1, y: y1 } = position1;
    let { x: x2, y: y2 } = position2;

    return { x: x2 - x1, y: y2 - y1 };
  } else {
    return { x: 0, y: 0 };
  }
};

/** Calculate the distance from the origin position to the destination position. */
const getDistance = (position1, position2) => {
  let { x, y } = getDistanceVector(position1, position2);
  return sqrt(x * x + y * y);
};

/** Calculate the directional angle to the destination position
 *  in terms of the angle oriented to the East. */
const getDirection = (position1, position2) => {
  let { x, y } = getDistanceVector(position1, position2);
  return atan2(y, x);
};

/** Detecting option support */
let passiveSupported = false;

try {
  let options = Object.defineProperty({}, "passive", {
    get: () => (passiveSupported = true)
  });

  window.addEventListener("test", null, options);
} catch (error) {}

const eventOptions = passiveSupported ? { passive: true } : false;

/* Mouse Buttons */
const LEFT_BUTTON = 1;
const MIDDLE_BUTTON = 2;
const RIGHT_BUTTON = 3;

/* Time delay determined to be a mouse stops moving,
   by default is 0.05 second. */
const STOP_DELAY = 50;

const documentMouseListeners = [];

const isValidDOMElement = element => {
  return (
    element &&
    element.addEventListener &&
    element.removeEventListener &&
    element.getBoundingClientRect
  );
};

const getOffsetPosition = element => {
  let elementRect = element.getBoundingClientRect();
  elementRect.x = elementRect.x || elementRect.left;
  elementRect.y = elementRect.y || elementRect.top;

  return {
    x: elementRect.x || elementRect.left,
    y: elementRect.y || elementRect.top
  };
};

document.addEventListener("mousemove", event => {
  for (let i = 0; i < documentMouseListeners.length; i++) {
    let mouseListener = documentMouseListeners[i];

    if (event.target !== mouseListener.mouse.listenElement) {
      mouseListener.moveEvent.call(mouseListener.mouse, event);
    }
  }
});

document.addEventListener("mouseup", event => {
  for (let i = 0; i < documentMouseListeners.length; i++) {
    let mouseListener = documentMouseListeners[i];

    if (event.target !== mouseListener.mouse.listenElement) {
      mouseListener.upEvent.call(mouseListener.mouse, event);
    }
  }
});

class Mouse {
  constructor(container) {
    /* The DOM element that this mouse is listening to. */
    this.listenElement = null;

    /* The thread for calling the mouse stop event function. */
    this.stoppingThread = null;

    /* Previous update time-stamp of all mouse actions. */
    this.lastUpdateTime = 0;

    /* Whether a mouse key is pressed down. */
    this.isMouseDown = false;

    /* The delta value when the mouse scrolls. */
    this.scrollDelta = 0;

    /* Whether the mouse is currently contacted by touch surface. */
    this.isTouching = false;

    /* Previous mouse position. */
    this.previousPosition = null;

    /* Previous mouse position when a mouse button was pressed. */
    this.previousDownPosition = null;

    /* Current mouse position. */
    this.position = null;

    /* Current mouse direction. */
    this.direction = 0;

    /* Current mouse moved distance. */
    this.movedDistance = 0;

    /* Current mouse moving speed. */
    this.movingSpeed = 0;

    /* Whether the mouse skips the default behaviours upon the listen element. */
    this.preventDefault = false;

    /* The list of listeners this mouse is appended to.
     * Each mouse event will trigger the corresponding method of each listeners. */
    this.overEvents = [];
    this.outEvents = [];
    this.downEvents = [];
    this.upEvents = [];
    this.moveEvents = [];
    this.scrollEvents = [];
    this.dragEvents = [];
    this.dragOverEvents = [];
    this.dropEvents = [];
    this.stopEvents = [];
    this.clickEvents = [];

    /* Add bindings to all event methods to secure scoping. */
    this._mouseOver = this._mouseOver.bind(this);
    this._mouseOut = this._mouseOut.bind(this);
    this._mouseDown = this._mouseDown.bind(this);
    this._mouseUp = this._mouseUp.bind(this);
    this._mouseMove = this._mouseMove.bind(this);
    this._scroll = this._scroll.bind(this);
    this._dragOver = this._dragOver.bind(this);
    this._drop = this._drop.bind(this);
    this._touchEnter = this._touchEnter.bind(this);
    this._touchLeave = this._touchLeave.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._touchEnd = this._touchEnd.bind(this);
    this._touchMove = this._touchMove.bind(this);
    this._touchCancel = this._touchCancel.bind(this);

    /*
      The event mapping which maps the types of event to
      which event listeners, and what events is depending
      on those listeners.
    */
    this.eventMap = {
      mouseover: {
        events: [this.overEvents],
        listeners: [
          { name: "mouseover", method: this._mouseOver },
          { name: "touchenter", method: this._touchEnter }
        ],
        added: false
      },
      mouseout: {
        events: [this.outEvents],
        listeners: [
          { name: "mouseout", method: this._mouseOut },
          { name: "touchleave", method: this._touchLeave },
          { name: "touchcancel", method: this._touchCancel }
        ],
        added: false
      },
      mousedown: {
        events: [this.downEvents, this.clickEvents, this.dragEvents],
        listeners: [
          { name: "mousedown", method: this._mouseDown },
          { name: "touchstart", method: this._touchStart }
        ],
        added: false
      },
      mouseup: {
        events: [this.upEvents, this.clickEvents, this.dragEvents],
        listeners: [
          { name: "mouseup", method: this._mouseUp },
          { name: "touchend", method: this._touchEnd }
        ],
        added: false
      },
      mousemove: {
        events: [this.moveEvents, this.dragEvents, this.stopEvents],
        listeners: [
          { name: "mousemove", method: this._mouseMove },
          { name: "touchmove", method: this._touchMove }
        ],
        added: false
      },
      mousescroll: {
        events: [this.scrollEvents],
        listeners: [
          { name: "mousewheel", method: this._scroll },
          { name: "DOMMouseScroll", method: this._scroll }
        ],
        added: false
      },
      mousedragover: {
        events: [this.dragOverEvents],
        listeners: [{ name: "dragover", method: this._dragOver }],
        added: false
      },
      mousedrop: {
        events: [this.dropEvents],
        listeners: [{ name: "drop", method: this._drop }],
        added: false
      }
    };

    /* Append the canvas to the DIV container. */
    if (container) {
      this.attach(container);
    }
  }

  /** Update listeners based on which events are in used. */
  _updateListeners() {
    const { listenElement, eventMap } = this;

    if (listenElement !== null) {
      Object.keys(eventMap).forEach(eventName => {
        const { events, listeners, added } = eventMap[eventName];
        const relevantEvents = [].concat.apply([], events);

        if (relevantEvents.length === 0 && added === true) {
          listeners.forEach(({ name, method }) =>
            listenElement.removeEventListener(name, method)
          );

          eventMap[eventName].added = false;
        } else if (relevantEvents.length > 0 && added === false) {
          listeners.forEach(({ name, method }) =>
            listenElement.addEventListener(name, method, eventOptions)
          );

          eventMap[eventName].added = true;
        }
      });
    }
  }

  /** Add all essential listeners onto the element. */
  _addListeners() {
    const { listenElement, eventMap } = this;

    Object.keys(eventMap).forEach(eventName => {
      const { events, listeners, added } = eventMap[eventName];
      const relevantEvents = [].concat.apply([], events);

      if (relevantEvents.length > 0 && added === false) {
        listeners.forEach(({ name, method }) =>
          listenElement.addEventListener(name, method, eventOptions)
        );

        eventMap[eventName].added = true;
      }
    });
  }

  /** Remove all listeners from the element. */
  _removeListeners() {
    const { listenElement, eventMap } = this;

    Object.keys(eventMap).forEach(eventName => {
      const { listeners, added } = eventMap[eventName];

      if (added === true) {
        listeners.forEach(({ name, method }) =>
          listenElement.removeEventListener(name, method)
        );

        eventMap[eventName].added = false;
      }
    });
  }

  /** Generic function for adding events. */
  _addEvent(event, events) {
    if (typeof event === "function") {
      events.push(event);
    }

    this._updateListeners();

    return () => this._removeEvent(event, events);
  }

  /** Generic function for removing events. */
  _removeEvent(event, events) {
    const index = events.indexOf(event);

    if (index !== -1) {
      events.splice(index, 1);
    }

    this._updateListeners();
  }

  /** Generic function for clearing all events. */
  _clearEvent(events) {
    events.splice(0, events.length);
    this._updateListeners();
  }

  /** Generic function for firing events. */
  _fireEvents(events, eventParams) {
    for (let i = 0; i < events.length; i++) {
      events[i](eventParams);
    }
  }

  /** When the mouse comes into the parent container. */
  _mouseOver(event) {
    let { isTouching, preventDefault } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse position with a null position to refresh the statistics. */
      this._updatePosition(null);

      /* Perform action for over event */
      this._fireEvents(this.overEvents, event);
    }
  }

  /** When the mouse moves out from the parent container. */
  _mouseOut(event) {
    let { isTouching, preventDefault } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse position with a null position to clear the statistics. */
      this._updatePosition(null);

      /* Perform action for out event */
      this._fireEvents(this.outEvents, event);
    }
  }

  /** When the mouse is pressed. */
  _mouseDown(event) {
    let { isTouching, preventDefault, listenElement } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Populate flags indicating which buton is pressed. */
      this.isLeftButton = event.which === LEFT_BUTTON;
      this.isMiddleButton = event.which === MIDDLE_BUTTON;
      this.isRightButton = event.which === RIGHT_BUTTON;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      let offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Update the mouse previous down position.
       * The variables needs to be extracted here after the update. */
      let { position } = this;

      this.previousDownPosition =
        position !== null ? { x: position.x, y: position.y } : null;

      /* Update the mouse down flag and time-stamp. */
      this.isMouseDown = true;

      /* Perform action for down event. */
      this._fireEvents(this.downEvents, event);

      this._addDocumentMouseListener();
    }
  }

  /** When the mouse's button is released. */
  _mouseUp(event) {
    let { isTouching, preventDefault, listenElement, isMouseDown } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Populate flags indicating which buton is pressed. */
      this.isLeftButton = event.which === LEFT_BUTTON;
      this.isMiddleButton = event.which === MIDDLE_BUTTON;
      this.isRightButton = event.which === RIGHT_BUTTON;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      let offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Update the mouse previous down position. */
      this.previousDownPosition = null;

      /* Run the client event method if the mouse was pressed previously. */
      if (isMouseDown) {
        this._click(event);
      }

      /* Update the mouse down flag. */
      this.isMouseDown = false;

      /* Perform action for up event. */
      this._fireEvents(this.upEvents, event);

      this._removeDocumentMouseListener();
    }
  }

  /** When the mouse is moving. */
  _mouseMove(event) {
    let {
      isTouching,
      preventDefault,
      listenElement,
      isMouseDown,
      stoppingThread
    } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      let offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Re-initiate the stopping thread. */
      clearTimeout(stoppingThread);
      this.stoppingThread = setTimeout(() => this._stop(event), STOP_DELAY);

      /* Perform action for move event. */
      this._fireEvents(this.moveEvents, event);

      /* If a mouse button is pressed, Perform action for drag event as well. */
      if (isMouseDown === true) {
        this._fireEvents(this.dragEvents, event);
      }
    }
  }

  /** When the mouse is scrolling. */
  _scroll(event) {
    let { isTouching, preventDefault, listenElement } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      let offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      this.scrollDelta = max(-1, min(1, event.wheelDelta || -event.detail));

      /* Perform action for scroll event. */
      this._fireEvents(this.scrollEvents, event);
    }
  }

  /** When the mouse is dragging something in the container. */
  _dragOver(event) {
    let { preventDefault, listenElement } = this;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse relative position. */
    let offsetPosition = getOffsetPosition(listenElement);

    this._updatePosition({
      x: event.clientX - offsetPosition.x,
      y: event.clientY - offsetPosition.y
    });

    /* Perform action for drag over event. */
    this._fireEvents(this.dragOverEvents, event);
  }

  /** When the mouse has dropped something in the container. */
  _drop(event) {
    let { preventDefault, listenElement } = this;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse relative position. */
    let offsetPosition = getOffsetPosition(listenElement);

    this._updatePosition({
      x: event.clientX - offsetPosition.x,
      y: event.clientY - offsetPosition.y
    });

    /* Perform action for drop event. */
    this._fireEvents(this.dropEvents, event);
  }

  /** When the mouse has stop moving in the container. */
  _stop(event) {
    let { isTouching } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Update the mouse to at rest. */
      this.movedDistance = 0;
      this.movingSpeed = 0;
      this.direction = 0;

      /* Perform action for stop event. */
      this._fireEvents(this.stopEvents, event);
    }
  }

  /** When the mouse clicks. */
  _click(event) {
    let { isTouching, preventDefault, listenElement } = this;

    if (isTouching === false) {
      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Populate flags indicating which buton is pressed. */
      this.isLeftButton = event.which === LEFT_BUTTON;
      this.isMiddleButton = event.which === MIDDLE_BUTTON;
      this.isRightButton = event.which === RIGHT_BUTTON;

      /* Update the mouse relative position. */
      let offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Perform action for click event. */
      this._fireEvents(this.clickEvents, event);
    }
  }

  /** When a contact is made on the touch surface. */
  _touchStart(event) {
    let { preventDefault, listenElement } = this;

    this.isTouching = true;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse relative position. */
    let offsetPosition = getOffsetPosition(listenElement);
    let firstTouch = event.changedTouches && event.changedTouches[0];

    this._updatePosition({
      x: firstTouch.clientX - offsetPosition.x,
      y: firstTouch.clientY - offsetPosition.y
    });

    /* Update the mouse down flag and time-stamp. */
    this.isMouseDown = true;

    /* Perform action for down event. */
    this._fireEvents(this.downEvents, event);
  }

  /** When a contact is remove on the touch surface. */
  _touchEnd(event) {
    let { preventDefault, listenElement, isMouseDown } = this;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse relative position. */
    let offsetPosition = getOffsetPosition(listenElement);
    let firstTouch = event.changedTouches && event.changedTouches[0];

    this._updatePosition({
      x: firstTouch.clientX - offsetPosition.x,
      y: firstTouch.clientY - offsetPosition.y
    });

    /* Run the client event method if the mouse was pressed previously. */
    if (isMouseDown) {
      this._click(event);
    }

    /* Update the mouse down flag. */
    this.isMouseDown = false;

    /* Perform action for up event. */
    this._fireEvents(this.upEvents, event);

    setTimeout(() => (this.isTouching = false), 0);
  }

  /** When a touch point moves across the touch surface. */
  _touchMove(event) {
    let { isMouseDown, preventDefault, listenElement, stoppingThread } = this;

    this.isTouching = true;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse relative position. */
    let offsetPosition = getOffsetPosition(listenElement);
    let firstTouch = event.changedTouches && event.changedTouches[0];

    this._updatePosition({
      x: firstTouch.clientX - offsetPosition.x,
      y: firstTouch.clientY - offsetPosition.y
    });

    /* Re-initiate the stopping thread. */
    clearTimeout(stoppingThread);
    this.stoppingThread = setTimeout(() => this._stop(event), STOP_DELAY);

    /* Perform action for move event. */
    this._fireEvents(this.moveEvents, event);

    /* If a mouse button is pressed, perform action for drag event as well. */
    if (isMouseDown === true) {
      this._fireEvents(this.dragEvents, event);
    }
  }

  /** When a contact enters the bound-to element on the touch surface. */
  _touchEnter(event) {
    let { preventDefault } = this;

    this.isTouching = true;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse position with a null position to refresh the statistics. */
    this._updatePosition(null);

    /* Perform action for over event */
    this._fireEvents(this.overEvents, event);
  }

  /** When a contact leaves the bound-to element on the touch surface. */
  _touchLeave(event) {
    let { preventDefault } = this;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse position with a null position to refresh the statistics. */
    this._updatePosition(null);

    /* Perform action for over event. */
    this._fireEvents(this.outEvents, event);

    setTimeout(() => (this.isTouching = false), 0);
  }

  /** When a contact gets cancelled. This can occur if the user has moved
   *	the touch point outside the browser UI or into a plugin or if an alert modal pops up. */
  _touchCancel(event) {
    let { preventDefault } = this;

    /* Put mouse as a reference in the event. */
    event.mouse = this;

    /* Skip the default behaviours upon this event. */
    if (preventDefault === true) {
      event.preventDefault();
    }

    /* Update the mouse position with a null position to refresh the statistics. */
    this._updatePosition(null);

    /* Perform action for over event. */
    this._fireEvents(this.outEvents, event);

    setTimeout(() => (this.isTouching = false), 0);
  }

  /** When the mouse is dragged, this method is called to retain tracking
   *  even when the mouse is outside the container. */
  _addDocumentMouseListener() {
    this.documentMouseListener = {
      mouse: this,
      moveEvent: this._mouseMove,
      upEvent: this._mouseUp
    };

    documentMouseListeners.push(this.documentMouseListener);
  }

  /** When a mouse drag ends, this method is called to lose track of
   *  the mouse when the it is outside the container. */
  _removeDocumentMouseListener() {
    let index = documentMouseListeners.indexOf(this.documentMouseListener);

    if (index !== -1) {
      documentMouseListeners.splice(index, 1);
    }
  }

  /** Update the Position of the mouse. */
  _updatePosition(newPosition) {
    /* Get the current time. */
    let currentTime = Date.now();
    let { position, lastUpdateTime } = this;

    /* Calculate the moved distance. */
    let movedDistance = getDistance(position, newPosition);

    this.movedDistance = movedDistance;

    /* Calculate the moving speed from time difference and distance. */
    let timeDiff = (currentTime - lastUpdateTime) / 1000;
    this.movingSpeed = timeDiff > 0 ? movedDistance / timeDiff : 0;

    /* Update the mouse direction with the new position. */
    this.direction = getDirection(position, newPosition);

    /* Update the mouse position. */
    this.previousPosition =
      position !== null ? { x: position.x, y: position.y } : null;

    this.position =
      newPosition !== null ? { x: newPosition.x, y: newPosition.y } : null;

    /* Update the time-stamp. */
    this.lastUpdateTime = currentTime;
  }

  /** Append the mouse to the a DOM element and event functions to it. */
  attach(element) {
    const { listenElement } = this;

    /* Remove the previous element first before attach a new one. */
    if (listenElement) {
      this.detach();
    }

    if (isValidDOMElement(element)) {
      /* Store a reference of the DOM element. */
      this.listenElement = element;

      /* Add the essential listeners. */
      this._addListeners();
    }
  }

  /** Disengage the mouse from DOM element and event functions from it. */
  detach() {
    /* Disengage all the mouse events from each corresponding handler. */
    this._removeListeners();

    /* Remove the reference of the DOM element. */
    this.listenElement = null;
  }

  /** Toggle value for mouse prevent default on all events. */
  setPreventDefault(preventDefault) {
    this.preventDefault = preventDefault === true;
  }

  /** Bind an event handler to the mouse over event. */
  onMouseOver(overEvent) {
    return this._addEvent(overEvent, this.overEvents);
  }

  /** Unbind an event handler to the mouse over event. */
  removeMouseOver(overEvent) {
    this._removeEvent(overEvent, this.overEvents);
  }

  /** Unbind all event handlers from the mouse over event. */
  clearMouseOver() {
    this._clearEvent(this.overEvents);
  }

  /** Bind an event handler to the mouse out event. */
  onMouseOut(outEvent) {
    return this._addEvent(outEvent, this.outEvents);
  }

  /** Unbind an event handler to the mouse out event. */
  removeMouseOut(outEvent) {
    this._removeEvent(outEvent, this.outEvents);
  }

  /** Unbind all event handlers from the mouse out event. */
  clearMouseOut() {
    this._clearEvent(this.outEvents);
  }

  /** Bind an event handler to the mouse down event. */
  onMouseDown(downEvent) {
    return this._addEvent(downEvent, this.downEvents);
  }

  /** Unbind an event handler to the mouse down event. */
  removeMouseDown(downEvent) {
    this._removeEvent(downEvent, this.downEvents);
  }

  /** Unbind all event handlers from the mouse down event. */
  clearMouseDown() {
    this._clearEvent(this.downEvents);
  }

  /** Bind an event handler to the mouse up event. */
  onMouseUp(upEvent) {
    return this._addEvent(upEvent, this.upEvents);
  }

  /** Unbind an event handler to the mouse up event. */
  removeMouseUp(upEvent) {
    this._removeEvent(upEvent, this.upEvents);
  }

  /** Unbind all event handlers from the mouse up event. */
  clearMouseUp() {
    this._clearEvent(this.upEvents);
  }

  /** Bind an event handler to the mouse move event. */
  onMouseMove(moveEvent) {
    return this._addEvent(moveEvent, this.moveEvents);
  }

  /** Unbind an event handler to the mouse move event. */
  removeMouseMove(moveEvent) {
    this._removeEvent(moveEvent, this.moveEvents);
  }

  /** Unbind all event handlers from the mouse move event. */
  clearMouseMove() {
    this._clearEvent(this.moveEvents);
  }

  /** Bind an event handler to the scroll event. */
  onScroll(scrollEvent) {
    return this._addEvent(scrollEvent, this.scrollEvents);
  }

  /** Unbind an event handler to the scroll event. */
  removeScroll(scrollEvent) {
    this._removeEvent(scrollEvent, this.scrollEvents);
  }

  /** Unbind all event handlers from the mouse scroll event. */
  clearScroll() {
    this._clearEvent(this.scrollEvents);
  }

  /** Bind an event handler to the drag event. */
  onDrag(dragEvent) {
    return this._addEvent(dragEvent, this.dragEvents);
  }

  /** Unbind an event handler to the drag event. */
  removeDrag(dragEvent) {
    this._removeEvent(dragEvent, this.dragEvents);
  }

  /** Unbind all event handlers from the mouse drag event. */
  clearDrag() {
    this._clearEvent(this.dragEvents);
  }

  /** Bind an event handler to the drag over event. */
  onDragOver(dragOverEvent) {
    return this._addEvent(dragOverEvent, this.dragOverEvents);
  }

  /** Unbind an event handler to the drag over event. */
  removeDragOver(dragOverEvent) {
    this._removeEvent(dragOverEvent, this.dragOverEvents);
  }

  /** Unbind all event handlers from the drag over event. */
  clearDragOver() {
    this._clearEvent(this.dragOverEvents);
  }

  /** Bind an event handler to the drop event. */
  onDrop(dropEvent) {
    return this._addEvent(dropEvent, this.dropEvents);
  }

  /** Unbind an event handler to the drop event. */
  removeDrop(dropEvent) {
    this._removeEvent(dropEvent, this.dropEvents);
  }

  /** Unbind all event handlers from the drop event. */
  clearDrop() {
    this._clearEvent(this.dropEvents);
  }

  /** Bind all event handlers from the stop event. */
  onStop(stopEvent) {
    return this._addEvent(stopEvent, this.stopEvents);
  }

  /** Unbind an event handler to the stop event. */
  removeStop(stopEvent) {
    this._removeEvent(stopEvent, this.stopEvents);
  }

  /** Unbind all event handlers from the stop event. */
  clearStop() {
    this._clearEvent(this.stopEvents);
  }

  /** Bind all event handlers from the click event. */
  onClick(clickEvent) {
    return this._addEvent(clickEvent, this.clickEvents);
  }

  /** Unbind an event handler to the click event. */
  removeClick(clickEvent) {
    this._removeEvent(clickEvent, this.clickEvents);
  }

  /** Unbind all event handlers from the click event. */
  clearClick() {
    this._clearEvent(this.clickEvents);
  }
}

export default Mouse;
