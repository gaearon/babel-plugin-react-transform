import _transformLib from "transform-lib";
const _components = {
  Foo: {
    displayName: "Foo"
  },
  _component: {},
  _component2: {},
  Bar: {
    displayName: "Bar"
  },
  _component3: {}
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

const Foo = _wrapComponent("Foo")(class Foo extends React.Component {});

export default Foo;

const _component = _wrapComponent("_component")(class extends React.Component {});

export default _component;
export default _wrapComponent("_component2")(React.createClass({}));
export const Bar = _wrapComponent("Bar")(class Bar extends React.Component {});
export const bar = _wrapComponent("_component3")(React.createClass({}));
