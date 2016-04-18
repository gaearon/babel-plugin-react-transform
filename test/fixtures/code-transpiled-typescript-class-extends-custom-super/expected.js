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

var Foo = _wrapComponent("Foo")(function (_super) {
    __extends(Foo, _super);
    function Foo() {
        _super.apply(this, arguments);
    }
    Foo.prototype.render = function () {};
    return Foo;
}(My.Custom.Base.Component));
var Bar = _wrapComponent("Bar")(function (_super) {
    __extends(Bar, _super);
    function Bar() {
        _super.apply(this, arguments);
    }
    Bar.prototype.render = function () {};
    return Bar;
}(CustomComponent));