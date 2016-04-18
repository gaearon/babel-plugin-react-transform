function factory() {
    return (function (_super) {
        __extends(Foo, _super);
        function Foo() {
            _super.apply(this, arguments);
        }
        Foo.prototype.render = function () { };
        return Foo;
    }(React.Component));
}