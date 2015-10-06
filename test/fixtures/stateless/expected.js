"use strict";

var _myCustomModuleWrap2 = require("my-custom-module/wrap");

var _myCustomModuleWrap3 = _interopRequireDefault(_myCustomModuleWrap2);

var _react = require("react");

var _myOtherCustomModuleWrap2 = require("my-other-custom-module/wrap");

var _myOtherCustomModuleWrap3 = _interopRequireDefault(_myOtherCustomModuleWrap2);

var _components = {
  _$SimpleComponent: {
    displayName: "SimpleComponent",
    isInFunction: true
  },
  _$Unknown: {
    isInFunction: true
  },
  _$Unknown2: {
    isInFunction: true
  },
  _$ComponentInsideFunction: {
    displayName: "ComponentInsideFunction",
    isInFunction: true
  },
  _$Unknown3: {
    isInFunction: true
  },
  _$factory: {
    displayName: "factory",
    isInFunction: true
  }
};

var _reactComponentWrapper = (0, _myCustomModuleWrap3["default"])({
  filename: "/Users/dkasten/projects/oss/babel-plugin-react-transform/test/fixtures/stateless/actual.js",
  components: _components,
  locals: [module],
  imports: [_react]
});

var _reactComponentWrapper2 = (0, _myOtherCustomModuleWrap3["default"])({
  filename: "/Users/dkasten/projects/oss/babel-plugin-react-transform/test/fixtures/stateless/actual.js",
  components: _components,
  locals: [],
  imports: []
});

function _wrapComponent(uniqueId) {
  return function (ReactClass) {
    return _reactComponentWrapper2(_reactComponentWrapper(ReactClass, uniqueId), uniqueId);
  };
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function NotComponent() {}

var StillNotAComponent = function StillNotAComponent() {};

var SimpleComponent = _wrapComponent("_$SimpleComponent")(function (props) {
  arbitraryComputation();

  return React.createElement("div", null);
});

var Something = Math.random() > .5 ? _wrapComponent("_$Unknown")(function (props) {
  return React.createElement("div", null);
}) : _wrapComponent("_$Unknown2")(function (props) {
  return React.createElement("span", null);
});

_wrapComponent("_$factory")(function factory() {
  var ComponentInsideFunction = _wrapComponent("_$ComponentInsideFunction")(function (props) {
    return React.createElement("div", null);
  });

  return _wrapComponent("_$Unknown3")(function (props) {
    return React.createElement("div", null);
  });
});

