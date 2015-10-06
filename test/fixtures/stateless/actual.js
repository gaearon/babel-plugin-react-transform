function NotComponent() {}

var StillNotAComponent = function() {};

let SimpleComponent = props => {
  arbitraryComputation();

  return <div />
};

let Something = (Math.random() > .5) ?
  props => <div /> :
  props => <span />;

function factory() {
  const ComponentInsideFunction = (props) => (
    <div />
  )

  return props => <div />;
}

