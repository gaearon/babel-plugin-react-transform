import React from 'react';

function FunctionDeclaration() {
  return <div />;
}

function NamedExportFunction() {
  return <div />;
}

function DefaultExportFunction() {
  return <div />;
}

const ModulePattern = {
  NoProps() {
    return <div />;
  },
  WithProps(props) {
    return <div {...props} />;
  }
};

export { NamedExportFunction };
export default DefaultExportFunction;
export default function () {
  return <div />;
}