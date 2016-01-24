import _transformLib from "transform-lib";
const _components = {
    class_1: {
        displayName: "class_1"
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

exports.Foo = _wrapComponent("class_1")(function () {
    function class_1() {}
    class_1.prototype.render = function () {};
    return class_1;
}());
