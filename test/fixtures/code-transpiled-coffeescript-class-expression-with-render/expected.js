import _transformLib from "transform-lib";
const _components = {
  _Class: {
    displayName: "_Class"
  },
  Foo: {
    displayName: "Foo"
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

var Foo;

foo(_wrapComponent("_Class")(function () {
  function _Class() {}

  _Class.prototype.render = function () {};

  return _Class;
}()));
foo(Foo = _wrapComponent("Foo")(function () {
  function Foo() {}

  Foo.prototype.render = function () {};

  return Foo;
}()));