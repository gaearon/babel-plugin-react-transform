// should ignore internal named Function to Class
function App() {
  function Component() {
    return <div>Ignored.</div>;
  }

  return <Component />;
}

export default App;
