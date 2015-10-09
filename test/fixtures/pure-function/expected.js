'use strict';

var _myCustomModuleWrap2 = require('my-custom-module/wrap');

var _myCustomModuleWrap3 = _interopRequireDefault(_myCustomModuleWrap2);

var _react = require('react');

var _myOtherCustomModuleWrap2 = require('my-other-custom-module/wrap');

var _myOtherCustomModuleWrap3 = _interopRequireDefault(_myOtherCustomModuleWrap2);

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _react2 = _interopRequireDefault(_react);

var _components = {
  _$FunctionDeclaration: {
    displayName: 'FunctionDeclaration',
    isFunction: true
  },
  _$NamedExportFunction: {
    displayName: 'NamedExportFunction',
    isFunction: true
  },
  _$DefaultExportFunction: {
    displayName: 'DefaultExportFunction',
    isFunction: true
  },
  _$NoProps: {
    displayName: 'NoProps',
    isFunction: true
  },
  _$WithProps: {
    displayName: 'WithProps',
    isFunction: true
  },
  _$actual: {
    displayName: 'actual',
    isFunction: true
  }
};

var _reactComponentWrapper = (0, _myCustomModuleWrap3['default'])({
  filename: '%FIXTURE_PATH%',
  components: _components,
  locals: [module],
  imports: [_react]
});

var _reactComponentWrapper2 = (0, _myOtherCustomModuleWrap3['default'])({
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function FunctionDeclaration() {
  return _react2['default'].createElement('div', null);
}

FunctionDeclaration = _wrapComponent('_$FunctionDeclaration')(FunctionDeclaration)
function NamedExportFunction() {
  return _react2['default'].createElement('div', null);
}

exports.NamedExportFunction = NamedExportFunction = _wrapComponent('_$NamedExportFunction')(NamedExportFunction)
function DefaultExportFunction() {
  return _react2['default'].createElement('div', null);
}

DefaultExportFunction = _wrapComponent('_$DefaultExportFunction')(DefaultExportFunction)
var ModulePattern = {
  NoProps: _wrapComponent('_$NoProps')(function () {
    return _react2['default'].createElement('div', null);
  }),
  WithProps: _wrapComponent('_$WithProps')(function (props) {
    return _react2['default'].createElement('div', props);
  })
};

exports.NamedExportFunction = NamedExportFunction;
exports['default'] = DefaultExportFunction;
exports['default'] = _wrapComponent('_$actual')(function () {
  return _react2['default'].createElement('div', null);
});
