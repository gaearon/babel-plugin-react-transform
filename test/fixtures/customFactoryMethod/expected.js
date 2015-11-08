'use strict';

var _wrap = require('my-other-custom-module/wrap');

var _wrap2 = _interopRequireDefault(_wrap);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _wrap3 = require('my-custom-module/wrap');

var _wrap4 = _interopRequireDefault(_wrap3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  _$A: {
    displayName: 'A'
  }
};

var _reactComponentWrapper = (0, _wrap4.default)({
  filename: '%FIXTURE_PATH%',
  components: _components,
  locals: [module],
  imports: [_react2.default]
});

var _reactComponentWrapper2 = (0, _wrap2.default)({
  filename: '%FIXTURE_PATH%',
  components: _components,
  locals: [],
  imports: []
});

function _wrapComponent(uniqueId) {
  return function (ReactClass) {
    return _reactComponentWrapper2(_reactComponentWrapper(ReactClass, uniqueId), uniqueId);
  };
}

var myComponentFactory = require('myComponentFactory');

var A = _wrapComponent('_$A')(myComponentFactory({
  displayName: 'A',

  render: function render() {}
}));
