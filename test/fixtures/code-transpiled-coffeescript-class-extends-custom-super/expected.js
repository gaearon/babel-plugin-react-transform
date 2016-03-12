import _transformLib from "transform-lib";
const _components = {
  Foo: {
    displayName: "Foo"
  },
  Bar: {
    displayName: "Bar"
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

var Foo, Bar;

Foo = _wrapComponent("Foo")(function (superClass) {
  extend(Foo, superClass);

  function Foo() {
    return Foo.__super__.constructor.apply(this, arguments);
  }

  Foo.prototype.render = function () {};

  return Foo;
}(My.Custom.Base.Component));

Bar = _wrapComponent("Bar")(function (superClass) {
  extend(Bar, superClass);

  function Bar() {
    return Bar.__super__.constructor.apply(this, arguments);
  }

  Bar.prototype.render = function () {};

  return Bar;
}(CustomComponent));