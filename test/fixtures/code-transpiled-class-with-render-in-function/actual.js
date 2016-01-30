function factory() {
    return (function () {
        function Foo() {
        }
        Foo.prototype.render = function () { };
        return Foo;
    })();
}