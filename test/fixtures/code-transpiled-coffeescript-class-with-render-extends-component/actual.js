var Foo;

Foo = (function(superClass) {
  extend(Foo, superClass);

  function Foo() {
    return Foo.__super__.constructor.apply(this, arguments);
  }

  Foo.prototype.render = function() {};

  return Foo;

})(React.Component);