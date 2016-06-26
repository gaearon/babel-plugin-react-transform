// should ignore unnamed functions
export default () => (
  <p>Ignored.</p>
);

export default function() {
  return <p>Ignored.</p>;
}
