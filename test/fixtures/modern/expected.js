"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _wrap = require("my-other-custom-module/wrap");

var _wrap2 = _interopRequireDefault(_wrap);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _wrap3 = require("my-custom-module/wrap");

var _wrap4 = _interopRequireDefault(_wrap3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  _$LikelyComponent: {
    displayName: "LikelyComponent"
  },
  _$ComponentInsideCondition: {
    displayName: "ComponentInsideCondition"
  },
  _$AnotherComponentInsideCondition: {
    displayName: "AnotherComponentInsideCondition"
  },
  _$ComponentInsideFunction: {
    displayName: "ComponentInsideFunction",
    isInFunction: true
  },
  _$ComponentInsideFunction2: {
    displayName: "ComponentInsideFunction",
    isInFunction: true
  }
};

var _reactComponentWrapper = (0, _wrap4.default)({
  filename: "%FIXTURE_PATH%",
  components: _components,
  locals: [module],
  imports: [_react2.default]
});

var _reactComponentWrapper2 = (0, _wrap2.default)({
  filename: "%FIXTURE_PATH%",
  components: _components,
  locals: [],
  imports: []
});

function _wrapComponent(uniqueId) {
  return function (ReactClass) {
    return _reactComponentWrapper2(_reactComponentWrapper(ReactClass, uniqueId), uniqueId);
  };
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotComponent = (function () {
  function NotComponent() {
    _classCallCheck(this, NotComponent);
  }

  _createClass(NotComponent, [{
    key: "bender",
    value: function bender() {}
  }]);

  return NotComponent;
})();

var LikelyComponent = (function () {
  function LikelyComponent() {
    _classCallCheck(this, LikelyComponent);
  }

  _createClass(LikelyComponent, [{
    key: "render",
    value: function render() {}
  }]);

  return LikelyComponent;
})();

var Something = Math.random() > .5 ? (function () {
  function ComponentInsideCondition() {
    _classCallCheck(this, ComponentInsideCondition);
  }

  _createClass(ComponentInsideCondition, [{
    key: "render",
    value: function render() {}
  }]);

  return ComponentInsideCondition;
})() : (function () {
  function AnotherComponentInsideCondition() {
    _classCallCheck(this, AnotherComponentInsideCondition);
  }

  _createClass(AnotherComponentInsideCondition, [{
    key: "render",
    value: function render() {}
  }]);

  return AnotherComponentInsideCondition;
})();

function factory() {
  var ComponentInsideFunction = (function () {
    function ComponentInsideFunction() {
      _classCallCheck(this, ComponentInsideFunction);
    }

    _createClass(ComponentInsideFunction, [{
      key: "render",
      value: function render() {}
    }]);

    return ComponentInsideFunction;
  })();

  return (function () {
    function ComponentInsideFunction() {
      _classCallCheck(this, ComponentInsideFunction);
    }

    _createClass(ComponentInsideFunction, [{
      key: "render",
      value: function render() {}
    }]);

    return ComponentInsideFunction;
  })();
}