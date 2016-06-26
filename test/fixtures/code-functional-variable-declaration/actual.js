// should transform internal root-level variables to Classes
const Component = (props) => {
  const { children } = props;

  return <div>{children}</div>;
};

export default Component;
