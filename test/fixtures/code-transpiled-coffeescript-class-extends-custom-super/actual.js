var Foo, Bar;

Foo = (function(superClass) {
  extend(Foo, superClass);

  function Foo() {
    return Foo.__super__.constructor.apply(this, arguments);
  }

  return Foo;

})(Component);

Bar = (function(superClass) {
  extend(Bar, superClass);

  function Bar() {
    return Bar.__super__.constructor.apply(this, arguments);
  }

  return Bar;

})(CustomComponent);