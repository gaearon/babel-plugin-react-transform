import _transformLib from "transform-lib";
const _components = {
    class_1: {
        displayName: "class_1"
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

foo(_wrapComponent("class_1")(function () {
    function class_1() {}
    class_1.prototype.render = function () {};
    return class_1;
}()));
foo(_wrapComponent("Foo")(function () {
    function Foo() {}
    Foo.prototype.render = function () {};
    return Foo;
}()));