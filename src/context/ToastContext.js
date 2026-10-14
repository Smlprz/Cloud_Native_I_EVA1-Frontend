import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onApiEvento } from '../api/client';

const ToastContext = createContext(null);
const DURACION_MS = 4500;
let contador = 0;

/** Avisos flotantes. Ademas muestra cada llamada que modifica datos: "POST /carrito/items -> 201". */
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const quitar = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const mostrar = useCallback(
    (tipo, texto, detalle) => {
      const id = ++contador;
      setAvisos((a) => [...a.slice(-3), { id, tipo, texto, detalle }]);
      setTimeout(() => quitar(id), DURACION_MS);
    },
    [quitar]
  );

  // Traza de llamadas POST / PUT / DELETE (util para probar y para la demostracion).
  useEffect(
    () =>
      onApiEvento(({ method, path, status, ok }) =>
        mostrar(ok ? 'traza-ok' : 'traza-error', `${method} ${path}`, status ? String(status) : 'sin respuesta')
      ),
    [mostrar]
  );

  const valor = useMemo(
    () => ({
      exito: (texto) => mostrar('exito', texto),
      error: (texto) => mostrar('error', texto),
      info: (texto) => mostrar('info', texto),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast-${a.tipo}`} onClick={() => quitar(a.id)}>
            <span>{a.texto}</span>
            {a.detalle && <strong>{a.detalle}</strong>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return contexto;
}
