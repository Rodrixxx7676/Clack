/**
 * IconoClima.jsx — El dibujito del tiempo: sol, nube, lluvia, nieve...
 * Recibe el nombre que le calcula el Modelo (Clima.icono).
 */
export default function IconoClima({ nombre, etiqueta }) {
  return (
    <svg
      className="icono-clima"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={etiqueta}
    >
      {DIBUJOS[nombre] ?? DIBUJOS.nube}
    </svg>
  );
}

const SOL = <circle cx="12" cy="12" r="4.2" />;
const RAYOS = (
  <path d="M12 3.2v1.8M12 19v1.8M3.2 12H5M19 12h1.8M5.8 5.8 7 7M17 17l1.2 1.2M18.2 5.8 17 7M7 17l-1.2 1.2" />
);
const LUNA = <path d="M19.5 13.6A7.6 7.6 0 0 1 10.8 4.9a7.8 7.8 0 1 0 8.7 8.7Z" />;
const NUBE = <path d="M7.4 18.5h9.2a3.6 3.6 0 0 0 .5-7.2 5.3 5.3 0 0 0-10.2.9 3.2 3.2 0 0 0 .5 6.3Z" />;
const NUBE_PEQUENA = (
  <path d="M9.6 19h7.6a3 3 0 0 0 .4-6 4.4 4.4 0 0 0-8.4.7A2.7 2.7 0 0 0 9.6 19Z" />
);

const DIBUJOS = {
  sol: (
    <>
      {SOL}
      {RAYOS}
    </>
  ),
  luna: LUNA,
  "sol-nube": (
    <>
      <circle cx="8.6" cy="8.2" r="3" />
      <path d="M8.6 2.6v1.4M3 8.2h1.4M4.7 4.3l1 1M12.5 4.3l-1 1" />
      {NUBE_PEQUENA}
    </>
  ),
  "luna-nube": (
    <>
      <path d="M13.4 8.4A4.6 4.6 0 0 1 8.2 3.2a4.7 4.7 0 1 0 5.2 5.2Z" />
      {NUBE_PEQUENA}
    </>
  ),
  nube: NUBE,
  niebla: (
    <>
      <path d="M6.6 13.4h9.6a3.3 3.3 0 0 0 .4-6.6 4.9 4.9 0 0 0-9.4.8 3 3 0 0 0-.6 5.8Z" />
      <path d="M4.5 17h15M7 20.4h10" />
    </>
  ),
  lluvia: (
    <>
      <path d="M7.4 15.4h9.2a3.6 3.6 0 0 0 .5-7.2 5.3 5.3 0 0 0-10.2.9 3.2 3.2 0 0 0 .5 6.3Z" />
      <path d="M9 18.4 8.2 21M13 18.4 12.2 21M17 18.4 16.2 21" />
    </>
  ),
  nieve: (
    <>
      <path d="M7.4 15.4h9.2a3.6 3.6 0 0 0 .5-7.2 5.3 5.3 0 0 0-10.2.9 3.2 3.2 0 0 0 .5 6.3Z" />
      <path d="M8.6 19h.01M12 20.4h.01M15.4 19h.01" />
    </>
  ),
  tormenta: (
    <>
      <path d="M7.4 14.4h9.2a3.6 3.6 0 0 0 .5-7.2 5.3 5.3 0 0 0-10.2.9 3.2 3.2 0 0 0 .5 6.3Z" />
      <path d="m12.8 16.4-2.4 3.4h3l-2.2 2.8" />
    </>
  ),
};
