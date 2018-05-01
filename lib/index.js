"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var min = Math.min,
    max = Math.max,
    sqrt = Math.sqrt,
    atan2 = Math.atan2;

/** Calculate the distance from the origin position to the destination position. */

var getDistanceVector = function getDistanceVector(position1, position2) {
  if (position1 && position2) {
    var x1 = position1.x,
        y1 = position1.y;
    var x2 = position2.x,
        y2 = position2.y;


    return { x: x2 - x1, y: y2 - y1 };
  } else {
    return { x: 0, y: 0 };
  }
};

/** Calculate the distance from the origin position to the destination position. */
var getDistance = function getDistance(position1, position2) {
  var _getDistanceVector = getDistanceVector(position1, position2),
      x = _getDistanceVector.x,
      y = _getDistanceVector.y;

  return sqrt(x * x + y * y);
};

/** Calculate the directional angle to the destination position
 *  in terms of the angle oriented to the East. */
var getDirection = function getDirection(position1, position2) {
  var _getDistanceVector2 = getDistanceVector(position1, position2),
      x = _getDistanceVector2.x,
      y = _getDistanceVector2.y;

  return atan2(y, x);
};

/** Detecting option support */
var passiveSupported = false;

try {
  var options = Object.defineProperty({}, "passive", {
    get: function get() {
      return passiveSupported = true;
    }
  });

  window.addEventListener("test", null, options);
} catch (error) {}

var eventOptions = passiveSupported ? { passive: true } : false;

/* Mouse Buttons */
var LEFT_BUTTON = 1;
var MIDDLE_BUTTON = 2;
var RIGHT_BUTTON = 3;

/* Time delay determined to be a mouse stops moving,
   by default is 0.05 second. */
var STOP_DELAY = 50;

var documentMouseListeners = [];

var isValidDOMElement = function isValidDOMElement(element) {
  return element && element.addEventListener && element.removeEventListener && element.getBoundingClientRect;
};

var getOffsetPosition = function getOffsetPosition(element) {
  var elementRect = element.getBoundingClientRect();
  elementRect.x = elementRect.x || elementRect.left;
  elementRect.y = elementRect.y || elementRect.top;

  return {
    x: elementRect.x || elementRect.left,
    y: elementRect.y || elementRect.top
  };
};

document.addEventListener("mousemove", function (event) {
  for (var i = 0; i < documentMouseListeners.length; i++) {
    var mouseListener = documentMouseListeners[i];

    if (event.target !== mouseListener.mouse.listenElement) {
      mouseListener.moveEvent.call(mouseListener.mouse, event);
    }
  }
});

document.addEventListener("mouseup", function (event) {
  for (var i = 0; i < documentMouseListeners.length; i++) {
    var mouseListener = documentMouseListeners[i];

    if (event.target !== mouseListener.mouse.listenElement) {
      mouseListener.upEvent.call(mouseListener.mouse, event);
    }
  }
});

var Mouse = function () {
  function Mouse(container) {
    _classCallCheck(this, Mouse);

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
        listeners: [{ name: "mouseover", method: this._mouseOver }, { name: "touchenter", method: this._touchEnter }],
        added: false
      },
      mouseout: {
        events: [this.outEvents],
        listeners: [{ name: "mouseout", method: this._mouseOut }, { name: "touchleave", method: this._touchLeave }, { name: "touchcancel", method: this._touchCancel }],
        added: false
      },
      mousedown: {
        events: [this.downEvents, this.clickEvents, this.dragEvents],
        listeners: [{ name: "mousedown", method: this._mouseDown }, { name: "touchstart", method: this._touchStart }],
        added: false
      },
      mouseup: {
        events: [this.upEvents, this.clickEvents, this.dragEvents],
        listeners: [{ name: "mouseup", method: this._mouseUp }, { name: "touchend", method: this._touchEnd }],
        added: false
      },
      mousemove: {
        events: [this.moveEvents, this.dragEvents, this.stopEvents],
        listeners: [{ name: "mousemove", method: this._mouseMove }, { name: "touchmove", method: this._touchMove }],
        added: false
      },
      mousescroll: {
        events: [this.scrollEvents],
        listeners: [{ name: "mousewheel", method: this._scroll }, { name: "DOMMouseScroll", method: this._scroll }],
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


  _createClass(Mouse, [{
    key: "_updateListeners",
    value: function _updateListeners() {
      var listenElement = this.listenElement,
          eventMap = this.eventMap;


      if (listenElement !== null) {
        Object.keys(eventMap).forEach(function (eventName) {
          var _eventMap$eventName = eventMap[eventName],
              events = _eventMap$eventName.events,
              listeners = _eventMap$eventName.listeners,
              added = _eventMap$eventName.added;

          var relevantEvents = [].concat.apply([], events);

          if (relevantEvents.length === 0 && added === true) {
            listeners.forEach(function (_ref) {
              var name = _ref.name,
                  method = _ref.method;
              return listenElement.removeEventListener(name, method);
            });

            eventMap[eventName].added = false;
          } else if (relevantEvents.length > 0 && added === false) {
            listeners.forEach(function (_ref2) {
              var name = _ref2.name,
                  method = _ref2.method;
              return listenElement.addEventListener(name, method, eventOptions);
            });

            eventMap[eventName].added = true;
          }
        });
      }
    }

    /** Add all essential listeners onto the element. */

  }, {
    key: "_addListeners",
    value: function _addListeners() {
      var listenElement = this.listenElement,
          eventMap = this.eventMap;


      Object.keys(eventMap).forEach(function (eventName) {
        var _eventMap$eventName2 = eventMap[eventName],
            events = _eventMap$eventName2.events,
            listeners = _eventMap$eventName2.listeners,
            added = _eventMap$eventName2.added;

        var relevantEvents = [].concat.apply([], events);

        if (relevantEvents.length > 0 && added === false) {
          listeners.forEach(function (_ref3) {
            var name = _ref3.name,
                method = _ref3.method;
            return listenElement.addEventListener(name, method, eventOptions);
          });

          eventMap[eventName].added = true;
        }
      });
    }

    /** Remove all listeners from the element. */

  }, {
    key: "_removeListeners",
    value: function _removeListeners() {
      var listenElement = this.listenElement,
          eventMap = this.eventMap;


      Object.keys(eventMap).forEach(function (eventName) {
        var _eventMap$eventName3 = eventMap[eventName],
            listeners = _eventMap$eventName3.listeners,
            added = _eventMap$eventName3.added;


        if (added === true) {
          listeners.forEach(function (_ref4) {
            var name = _ref4.name,
                method = _ref4.method;
            return listenElement.removeEventListener(name, method);
          });

          eventMap[eventName].added = false;
        }
      });
    }

    /** Generic function for adding events. */

  }, {
    key: "_addEvent",
    value: function _addEvent(event, events) {
      var _this = this;

      if (typeof event === "function") {
        events.push(event);
      }

      this._updateListeners();

      return function () {
        return _this._removeEvent(event, events);
      };
    }

    /** Generic function for removing events. */

  }, {
    key: "_removeEvent",
    value: function _removeEvent(event, events) {
      var index = events.indexOf(event);

      if (index !== -1) {
        events.splice(index, 1);
      }

      this._updateListeners();
    }

    /** Generic function for clearing all events. */

  }, {
    key: "_clearEvent",
    value: function _clearEvent(events) {
      events.splice(0, events.length);
      this._updateListeners();
    }

    /** Generic function for firing events. */

  }, {
    key: "_fireEvents",
    value: function _fireEvents(events, eventParams) {
      for (var i = 0; i < events.length; i++) {
        events[i](eventParams);
      }
    }

    /** When the mouse comes into the parent container. */

  }, {
    key: "_mouseOver",
    value: function _mouseOver(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault;


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

  }, {
    key: "_mouseOut",
    value: function _mouseOut(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault;


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

  }, {
    key: "_mouseDown",
    value: function _mouseDown(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement;


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
        var offsetPosition = getOffsetPosition(listenElement);

        this._updatePosition({
          x: event.clientX - offsetPosition.x,
          y: event.clientY - offsetPosition.y
        });

        /* Update the mouse previous down position.
         * The variables needs to be extracted here after the update. */
        var position = this.position;


        this.previousDownPosition = position !== null ? { x: position.x, y: position.y } : null;

        /* Update the mouse down flag and time-stamp. */
        this.isMouseDown = true;

        /* Perform action for down event. */
        this._fireEvents(this.downEvents, event);

        this._addDocumentMouseListener();
      }
    }

    /** When the mouse's button is released. */

  }, {
    key: "_mouseUp",
    value: function _mouseUp(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement,
          isMouseDown = this.isMouseDown;


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
        var offsetPosition = getOffsetPosition(listenElement);

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

  }, {
    key: "_mouseMove",
    value: function _mouseMove(event) {
      var _this2 = this;

      var isTouching = this.isTouching,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement,
          isMouseDown = this.isMouseDown,
          stoppingThread = this.stoppingThread;


      if (isTouching === false) {
        /* Put mouse as a reference in the event. */
        event.mouse = this;

        /* Skip the default behaviours upon this event. */
        if (preventDefault === true) {
          event.preventDefault();
        }

        /* Update the mouse relative position. */
        var offsetPosition = getOffsetPosition(listenElement);

        this._updatePosition({
          x: event.clientX - offsetPosition.x,
          y: event.clientY - offsetPosition.y
        });

        /* Re-initiate the stopping thread. */
        clearTimeout(stoppingThread);
        this.stoppingThread = setTimeout(function () {
          return _this2._stop(event);
        }, STOP_DELAY);

        /* Perform action for move event. */
        this._fireEvents(this.moveEvents, event);

        /* If a mouse button is pressed, Perform action for drag event as well. */
        if (isMouseDown === true) {
          this._fireEvents(this.dragEvents, event);
        }
      }
    }

    /** When the mouse is scrolling. */

  }, {
    key: "_scroll",
    value: function _scroll(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement;


      if (isTouching === false) {
        /* Put mouse as a reference in the event. */
        event.mouse = this;

        /* Skip the default behaviours upon this event. */
        if (preventDefault === true) {
          event.preventDefault();
        }

        /* Update the mouse relative position. */
        var offsetPosition = getOffsetPosition(listenElement);

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

  }, {
    key: "_dragOver",
    value: function _dragOver(event) {
      var preventDefault = this.preventDefault,
          listenElement = this.listenElement;

      /* Put mouse as a reference in the event. */

      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      var offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Perform action for drag over event. */
      this._fireEvents(this.dragOverEvents, event);
    }

    /** When the mouse has dropped something in the container. */

  }, {
    key: "_drop",
    value: function _drop(event) {
      var preventDefault = this.preventDefault,
          listenElement = this.listenElement;

      /* Put mouse as a reference in the event. */

      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      var offsetPosition = getOffsetPosition(listenElement);

      this._updatePosition({
        x: event.clientX - offsetPosition.x,
        y: event.clientY - offsetPosition.y
      });

      /* Perform action for drop event. */
      this._fireEvents(this.dropEvents, event);
    }

    /** When the mouse has stop moving in the container. */

  }, {
    key: "_stop",
    value: function _stop(event) {
      var isTouching = this.isTouching;


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

  }, {
    key: "_click",
    value: function _click(event) {
      var isTouching = this.isTouching,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement;


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
        var offsetPosition = getOffsetPosition(listenElement);

        this._updatePosition({
          x: event.clientX - offsetPosition.x,
          y: event.clientY - offsetPosition.y
        });

        /* Perform action for click event. */
        this._fireEvents(this.clickEvents, event);
      }
    }

    /** When a contact is made on the touch surface. */

  }, {
    key: "_touchStart",
    value: function _touchStart(event) {
      var preventDefault = this.preventDefault,
          listenElement = this.listenElement;


      this.isTouching = true;

      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      var offsetPosition = getOffsetPosition(listenElement);
      var firstTouch = event.changedTouches && event.changedTouches[0];

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

  }, {
    key: "_touchEnd",
    value: function _touchEnd(event) {
      var _this3 = this;

      var preventDefault = this.preventDefault,
          listenElement = this.listenElement,
          isMouseDown = this.isMouseDown;

      /* Put mouse as a reference in the event. */

      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      var offsetPosition = getOffsetPosition(listenElement);
      var firstTouch = event.changedTouches && event.changedTouches[0];

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

      setTimeout(function () {
        return _this3.isTouching = false;
      }, 0);
    }

    /** When a touch point moves across the touch surface. */

  }, {
    key: "_touchMove",
    value: function _touchMove(event) {
      var _this4 = this;

      var isMouseDown = this.isMouseDown,
          preventDefault = this.preventDefault,
          listenElement = this.listenElement,
          stoppingThread = this.stoppingThread;


      this.isTouching = true;

      /* Put mouse as a reference in the event. */
      event.mouse = this;

      /* Skip the default behaviours upon this event. */
      if (preventDefault === true) {
        event.preventDefault();
      }

      /* Update the mouse relative position. */
      var offsetPosition = getOffsetPosition(listenElement);
      var firstTouch = event.changedTouches && event.changedTouches[0];

      this._updatePosition({
        x: firstTouch.clientX - offsetPosition.x,
        y: firstTouch.clientY - offsetPosition.y
      });

      /* Re-initiate the stopping thread. */
      clearTimeout(stoppingThread);
      this.stoppingThread = setTimeout(function () {
        return _this4._stop(event);
      }, STOP_DELAY);

      /* Perform action for move event. */
      this._fireEvents(this.moveEvents, event);

      /* If a mouse button is pressed, perform action for drag event as well. */
      if (isMouseDown === true) {
        this._fireEvents(this.dragEvents, event);
      }
    }

    /** When a contact enters the bound-to element on the touch surface. */

  }, {
    key: "_touchEnter",
    value: function _touchEnter(event) {
      var preventDefault = this.preventDefault;


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

  }, {
    key: "_touchLeave",
    value: function _touchLeave(event) {
      var _this5 = this;

      var preventDefault = this.preventDefault;

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

      setTimeout(function () {
        return _this5.isTouching = false;
      }, 0);
    }

    /** When a contact gets cancelled. This can occur if the user has moved
     *	the touch point outside the browser UI or into a plugin or if an alert modal pops up. */

  }, {
    key: "_touchCancel",
    value: function _touchCancel(event) {
      var _this6 = this;

      var preventDefault = this.preventDefault;

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

      setTimeout(function () {
        return _this6.isTouching = false;
      }, 0);
    }

    /** When the mouse is dragged, this method is called to retain tracking
     *  even when the mouse is outside the container. */

  }, {
    key: "_addDocumentMouseListener",
    value: function _addDocumentMouseListener() {
      this.documentMouseListener = {
        mouse: this,
        moveEvent: this._mouseMove,
        upEvent: this._mouseUp
      };

      documentMouseListeners.push(this.documentMouseListener);
    }

    /** When a mouse drag ends, this method is called to lose track of
     *  the mouse when the it is outside the container. */

  }, {
    key: "_removeDocumentMouseListener",
    value: function _removeDocumentMouseListener() {
      var index = documentMouseListeners.indexOf(this.documentMouseListener);

      if (index !== -1) {
        documentMouseListeners.splice(index, 1);
      }
    }

    /** Update the Position of the mouse. */

  }, {
    key: "_updatePosition",
    value: function _updatePosition(newPosition) {
      /* Get the current time. */
      var currentTime = Date.now();
      var position = this.position,
          lastUpdateTime = this.lastUpdateTime;

      /* Calculate the moved distance. */

      var movedDistance = getDistance(position, newPosition);

      this.movedDistance = movedDistance;

      /* Calculate the moving speed from time difference and distance. */
      var timeDiff = (currentTime - lastUpdateTime) / 1000;
      this.movingSpeed = timeDiff > 0 ? movedDistance / timeDiff : 0;

      /* Update the mouse direction with the new position. */
      this.direction = getDirection(position, newPosition);

      /* Update the mouse position. */
      this.previousPosition = position !== null ? { x: position.x, y: position.y } : null;

      this.position = newPosition !== null ? { x: newPosition.x, y: newPosition.y } : null;

      /* Update the time-stamp. */
      this.lastUpdateTime = currentTime;
    }

    /** Append the mouse to the a DOM element and event functions to it. */

  }, {
    key: "attach",
    value: function attach(element) {
      var listenElement = this.listenElement;

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

  }, {
    key: "detach",
    value: function detach() {
      /* Disengage all the mouse events from each corresponding handler. */
      this._removeListeners();

      /* Remove the reference of the DOM element. */
      this.listenElement = null;
    }

    /** Toggle value for mouse prevent default on all events. */

  }, {
    key: "setPreventDefault",
    value: function setPreventDefault(preventDefault) {
      this.preventDefault = preventDefault === true;
    }

    /** Bind an event handler to the mouse over event. */

  }, {
    key: "onMouseOver",
    value: function onMouseOver(overEvent) {
      return this._addEvent(overEvent, this.overEvents);
    }

    /** Unbind an event handler to the mouse over event. */

  }, {
    key: "removeMouseOver",
    value: function removeMouseOver(overEvent) {
      this._removeEvent(overEvent, this.overEvents);
    }

    /** Unbind all event handlers from the mouse over event. */

  }, {
    key: "clearMouseOver",
    value: function clearMouseOver() {
      this._clearEvent(this.overEvents);
    }

    /** Bind an event handler to the mouse out event. */

  }, {
    key: "onMouseOut",
    value: function onMouseOut(outEvent) {
      return this._addEvent(outEvent, this.outEvents);
    }

    /** Unbind an event handler to the mouse out event. */

  }, {
    key: "removeMouseOut",
    value: function removeMouseOut(outEvent) {
      this._removeEvent(outEvent, this.outEvents);
    }

    /** Unbind all event handlers from the mouse out event. */

  }, {
    key: "clearMouseOut",
    value: function clearMouseOut() {
      this._clearEvent(this.outEvents);
    }

    /** Bind an event handler to the mouse down event. */

  }, {
    key: "onMouseDown",
    value: function onMouseDown(downEvent) {
      return this._addEvent(downEvent, this.downEvents);
    }

    /** Unbind an event handler to the mouse down event. */

  }, {
    key: "removeMouseDown",
    value: function removeMouseDown(downEvent) {
      this._removeEvent(downEvent, this.downEvents);
    }

    /** Unbind all event handlers from the mouse down event. */

  }, {
    key: "clearMouseDown",
    value: function clearMouseDown() {
      this._clearEvent(this.downEvents);
    }

    /** Bind an event handler to the mouse up event. */

  }, {
    key: "onMouseUp",
    value: function onMouseUp(upEvent) {
      return this._addEvent(upEvent, this.upEvents);
    }

    /** Unbind an event handler to the mouse up event. */

  }, {
    key: "removeMouseUp",
    value: function removeMouseUp(upEvent) {
      this._removeEvent(upEvent, this.upEvents);
    }

    /** Unbind all event handlers from the mouse up event. */

  }, {
    key: "clearMouseUp",
    value: function clearMouseUp() {
      this._clearEvent(this.upEvents);
    }

    /** Bind an event handler to the mouse move event. */

  }, {
    key: "onMouseMove",
    value: function onMouseMove(moveEvent) {
      return this._addEvent(moveEvent, this.moveEvents);
    }

    /** Unbind an event handler to the mouse move event. */

  }, {
    key: "removeMouseMove",
    value: function removeMouseMove(moveEvent) {
      this._removeEvent(moveEvent, this.moveEvents);
    }

    /** Unbind all event handlers from the mouse move event. */

  }, {
    key: "clearMouseMove",
    value: function clearMouseMove() {
      this._clearEvent(this.moveEvents);
    }

    /** Bind an event handler to the scroll event. */

  }, {
    key: "onScroll",
    value: function onScroll(scrollEvent) {
      return this._addEvent(scrollEvent, this.scrollEvents);
    }

    /** Unbind an event handler to the scroll event. */

  }, {
    key: "removeScroll",
    value: function removeScroll(scrollEvent) {
      this._removeEvent(scrollEvent, this.scrollEvents);
    }

    /** Unbind all event handlers from the mouse scroll event. */

  }, {
    key: "clearScroll",
    value: function clearScroll() {
      this._clearEvent(this.scrollEvents);
    }

    /** Bind an event handler to the drag event. */

  }, {
    key: "onDrag",
    value: function onDrag(dragEvent) {
      return this._addEvent(dragEvent, this.dragEvents);
    }

    /** Unbind an event handler to the drag event. */

  }, {
    key: "removeDrag",
    value: function removeDrag(dragEvent) {
      this._removeEvent(dragEvent, this.dragEvents);
    }

    /** Unbind all event handlers from the mouse drag event. */

  }, {
    key: "clearDrag",
    value: function clearDrag() {
      this._clearEvent(this.dragEvents);
    }

    /** Bind an event handler to the drag over event. */

  }, {
    key: "onDragOver",
    value: function onDragOver(dragOverEvent) {
      return this._addEvent(dragOverEvent, this.dragOverEvents);
    }

    /** Unbind an event handler to the drag over event. */

  }, {
    key: "removeDragOver",
    value: function removeDragOver(dragOverEvent) {
      this._removeEvent(dragOverEvent, this.dragOverEvents);
    }

    /** Unbind all event handlers from the drag over event. */

  }, {
    key: "clearDragOver",
    value: function clearDragOver() {
      this._clearEvent(this.dragOverEvents);
    }

    /** Bind an event handler to the drop event. */

  }, {
    key: "onDrop",
    value: function onDrop(dropEvent) {
      return this._addEvent(dropEvent, this.dropEvents);
    }

    /** Unbind an event handler to the drop event. */

  }, {
    key: "removeDrop",
    value: function removeDrop(dropEvent) {
      this._removeEvent(dropEvent, this.dropEvents);
    }

    /** Unbind all event handlers from the drop event. */

  }, {
    key: "clearDrop",
    value: function clearDrop() {
      this._clearEvent(this.dropEvents);
    }

    /** Bind all event handlers from the stop event. */

  }, {
    key: "onStop",
    value: function onStop(stopEvent) {
      return this._addEvent(stopEvent, this.stopEvents);
    }

    /** Unbind an event handler to the stop event. */

  }, {
    key: "removeStop",
    value: function removeStop(stopEvent) {
      this._removeEvent(stopEvent, this.stopEvents);
    }

    /** Unbind all event handlers from the stop event. */

  }, {
    key: "clearStop",
    value: function clearStop() {
      this._clearEvent(this.stopEvents);
    }

    /** Bind all event handlers from the click event. */

  }, {
    key: "onClick",
    value: function onClick(clickEvent) {
      return this._addEvent(clickEvent, this.clickEvents);
    }

    /** Unbind an event handler to the click event. */

  }, {
    key: "removeClick",
    value: function removeClick(clickEvent) {
      this._removeEvent(clickEvent, this.clickEvents);
    }

    /** Unbind all event handlers from the click event. */

  }, {
    key: "clearClick",
    value: function clearClick() {
      this._clearEvent(this.clickEvents);
    }
  }]);

  return Mouse;
}();

exports.default = Mouse;