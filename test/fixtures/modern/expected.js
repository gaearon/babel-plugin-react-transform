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
  var _LikelyComponent = (function () {
    function LikelyComponent() {
      _classCallCheck(this, LikelyComponent);
    }

    _createClass(LikelyComponent, [{
      key: "render",
      value: function render() {}
    }]);

    return LikelyComponent;
  })();

  return _wrapComponent("_$LikelyComponent")(_LikelyComponent) || _LikelyComponent;
})();

var Something = Math.random() > .5 ? (function () {
  var _ComponentInsideCondi = (function () {
    function ComponentInsideCondition() {
      _classCallCheck(this, ComponentInsideCondition);
    }

    _createClass(ComponentInsideCondition, [{
      key: "render",
      value: function render() {}
    }]);

    return ComponentInsideCondition;
  })();

  return _wrapComponent("_$ComponentInsideCondition")(_ComponentInsideCondi) || _ComponentInsideCondi;
})() : (function () {
  var _AnotherComponentInsi = (function () {
    function AnotherComponentInsideCondition() {
      _classCallCheck(this, AnotherComponentInsideCondition);
    }

    _createClass(AnotherComponentInsideCondition, [{
      key: "render",
      value: function render() {}
    }]);

    return AnotherComponentInsideCondition;
  })();

  return _wrapComponent("_$AnotherComponentInsideCondition")(_AnotherComponentInsi) || _AnotherComponentInsi;
})();

function factory() {
  var ComponentInsideFunction = (function () {
    var _ComponentInsideFunct = (function () {
      function ComponentInsideFunction() {
        _classCallCheck(this, ComponentInsideFunction);
      }

      _createClass(ComponentInsideFunction, [{
        key: "render",
        value: function render() {}
      }]);

      return ComponentInsideFunction;
    })();

    return _wrapComponent("_$ComponentInsideFunction")(_ComponentInsideFunct) || _ComponentInsideFunct;
  })();

  return (function () {
    var _ComponentInsideFunct2 = (function () {
      function ComponentInsideFunction() {
        _classCallCheck(this, ComponentInsideFunction);
      }

      _createClass(ComponentInsideFunction, [{
        key: "render",
        value: function render() {}
      }]);

      return ComponentInsideFunction;
    })();

    return _wrapComponent("_$ComponentInsideFunction2")(_ComponentInsideFunct2) || _ComponentInsideFunct2;
  })();
}

