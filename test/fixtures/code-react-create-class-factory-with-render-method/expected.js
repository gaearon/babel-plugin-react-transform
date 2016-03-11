import _transformLib from 'transform-lib';
const _components = {
  Foo: {
    displayName: 'Foo'
  },
  _component: {},
  _component2: {}
};

const _transformLib2 = _transformLib({
  filename: '%FIXTURE_PATH%',
  components: _components,
  locals: [],
  imports: []
});

function _wrapComponent(id) {
  return function (Component) {
    return _transformLib2(Component, id);
  };
}

import { createClass } from 'react';

const Foo = _wrapComponent('Foo')(createClass({
  displayName: 'Foo',
  render: function () {}
}));

_wrapComponent('_component')(createClass({
  render: function () {}
}));

const Bar = _wrapComponent('_component2')(createClass({
  render: function () {}
}));
