import _transformLib from 'transform-lib';
const _components = {
  _component: {},
  _component2: {},
  _component3: {}
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

_wrapComponent('_component')(factory({
  render() {}
}));

_wrapComponent('_component2')(factory({
  render: function () {}
}));

_wrapComponent('_component3')(factory({
  'render': function () {}
}));
