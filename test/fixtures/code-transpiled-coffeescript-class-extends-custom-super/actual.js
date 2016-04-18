var Foo, Bar;

Foo = (function(superClass) {
  extend(Foo, superClass);

  function Foo() {
    return Foo.__super__.constructor.apply(this, arguments);
  }

  Foo.prototype.render = function() {};

  return Foo;

})(My.Custom.Base.Component);

Bar = (function(superClass) {
  extend(Bar, superClass);

  function Bar() {
    return Bar.__super__.constructor.apply(this, arguments);
  }

  Bar.prototype.render = function() {};

  return Bar;

})(CustomComponent);