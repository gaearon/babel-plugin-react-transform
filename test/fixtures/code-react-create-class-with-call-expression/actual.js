const myCreateClass = (spec) => {
  const propTypes = Object.assign({
    model: React.PropTypes.object.isRequired
  }, spec.propTypes);

  const updatedSpec = Object.assign({}, spec, { propTypes });

  return React.createClass(updatedSpec);
};
