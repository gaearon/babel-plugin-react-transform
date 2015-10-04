class NotComponent {
  bender() {}
}

class LikelyComponent {
  render() {}
}

class ComponentWithJSX {
  render() {
    return <div />;
  }
}

let Something = (Math.random() > .5) ?
  class ComponentInsideCondition { render() { } } :
  class AnotherComponentInsideCondition { render() { } };

function factory() {
  class ComponentInsideFunction {
    render() { }
  }

  return class ComponentInsideFunction {
    render() { }
  };
}
