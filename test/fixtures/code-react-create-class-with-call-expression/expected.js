import _transformLib from "transform-lib";
const _components = {
  _component: {
    isInFunction: true
  }
};

const _transformLib2 = _transformLib({
  filename: "%FIXTURE_PATH%",
  components: _components,
  locals: [],
  imports: []
});

function _wrapComponent(id) {
  return function (Component) {
    return _transformLib2(Component, id);
  };
}

const myCreateClass = spec => {
  const propTypes = Object.assign({
    model: React.PropTypes.object.isRequired
  }, spec.propTypes);

  const updatedSpec = Object.assign({}, spec, { propTypes });

  return _wrapComponent("_component")(React.createClass(updatedSpec));
};
