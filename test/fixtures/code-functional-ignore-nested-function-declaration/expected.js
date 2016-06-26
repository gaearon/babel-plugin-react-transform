import _transformLib from "transform-lib";
const _components = {
  App: {
    displayName: "App"
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

import React from "react";

const App = _wrapComponent("App")(class App extends React.Component {
  render() {
    function Component() {
      return React.createElement(
        "div",
        null,
        "Ignored."
      );
    }

    return React.createElement(Component, null);
  }

});

export default App;
