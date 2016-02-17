// should transform internal named Function to Class
function Component(props) {
  const { children } = props;

  return <div>{children}</div>;
}

export default Component;
