import React from 'react';

/** Estado de una pantalla: cargando, error, informacion o vacio. Evita pantallas en blanco. */
export default function Estado({ tipo = 'info', titulo, texto, accion }) {
  return (
    <div className={`estado estado-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {tipo === 'cargando' && <span className="spinner" aria-hidden="true" />}
      {titulo && <h2>{titulo}</h2>}
      {texto && <p>{texto}</p>}
      {accion && (
        <button type="button" className="btn" onClick={accion.onClick}>
          {accion.texto}
        </button>
      )}
    </div>
  );
}
