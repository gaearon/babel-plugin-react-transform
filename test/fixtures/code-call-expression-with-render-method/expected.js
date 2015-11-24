import _transformLib from 'transform-lib';
const _components = {
  Unknown0: {},
  Unknown1: {},
  Unknown2: {}
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

_wrapComponent('Unknown0')(factory({
  render() {}
}));

_wrapComponent('Unknown1')(factory({
  render: function () {}
}));

_wrapComponent('Unknown2')(factory({
  'render': function () {}
}));
