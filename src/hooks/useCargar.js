import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carga datos asincronos con estados { datos, cargando, error } y `recargar()`.
 * Ignora respuestas de peticiones viejas (evita pisar datos si el usuario navega rapido).
 * `habilitado=false` pospone la carga (por ejemplo hasta tener sesion).
 */
export default function useCargar(funcion, dependencias = [], habilitado = true) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(habilitado);
  const [error, setError] = useState('');
  const version = useRef(0);

  const ejecutar = useCallback(() => {
    const actual = ++version.current;
    setCargando(true);
    setError('');
    return Promise.resolve()
      .then(funcion)
      .then((resultado) => {
        if (actual === version.current) setDatos(resultado);
      })
      .catch((e) => {
        if (actual === version.current) setError(e.message || 'No se pudo cargar');
      })
      .finally(() => {
        if (actual === version.current) setCargando(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    if (habilitado) ejecutar();
    else setCargando(false);
  }, [habilitado, ejecutar]);

  return { datos, cargando, error, recargar: ejecutar };
}
