/**
 * MarcaClack.jsx — El logo y el nombre de la app.
 */
export default function MarcaClack() {
  return (
    <div className="marca">
      <svg className="marca__icono" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 6.8V12l3.4 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Clack</span>
    </div>
  );
}
