import React from 'react';

function DefaultFunction() {
  return <div />;
}

function NamedExportFunction() {
  return <div />;
}

function DefaultExportFunction() {
  return <div />;
}

export { NamedExportFunction };
export default DefaultExportFunction;
export default function () {
  return <div />;
}