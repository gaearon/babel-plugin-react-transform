var Foo;

foo((function() {
  function _Class() {}

  _Class.prototype.render = function() {};

  return _Class;

})());
foo(Foo = (function() {
  function Foo() {}

  Foo.prototype.render = function() {};

  return Foo;

})());