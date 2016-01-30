import _transformLib from "transform-lib";
const _components = {
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

Foo = _wrapComponent("Foo")(function (superClass) {
  extend(Foo, superClass);

  function Foo() {
    return Foo.__super__.constructor.apply(this, arguments);
  }

  Foo.prototype.render = function () {};

  return Foo;
}(React.Component));