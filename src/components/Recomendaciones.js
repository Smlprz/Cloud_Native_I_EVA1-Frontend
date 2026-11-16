import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import { PLACEHOLDER, resolverImagen } from '../utils/imagenes';
import { precio } from '../utils/formato';

/**
 * Productos parecidos a los que el usuario ha consultado (ms-analytics-recommendations).
 * Las recomendaciones se calculan con los eventos de navegacion que llegan por Kafka. Es un extra: si el
 * servicio no responde o no hay sugerencias, la seccion simplemente no aparece y el resto de la pagina no cambia.
 */
export default function Recomendaciones({ productoId }) {
  const { autenticado, getToken } = useAuth();
  const { datos, cargando } = useCargar(
    async () => api.analytics.recomendaciones(await getToken(), { productoId }),
    [productoId, autenticado],
    autenticado
  );

  if (!autenticado) return null;
  if (cargando) return <p className="texto-suave">Buscando recomendaciones...</p>;
  if (!datos || datos.length === 0) return null;

  return (
    <section className="recomendados" aria-label="Productos recomendados">
      <h2>Recomendados para ti</h2>
      <p className="texto-suave">Segun los productos que has estado consultando.</p>
      <div className="recomendados-grilla">
        {datos.map((r) => (
          <article key={r.productoId} className="card">
            <Link to={`/productos/${r.productoId}`} className="card-imagen">
              <img
                src={resolverImagen(r.imagenUrl)}
                alt={r.nombre}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
            </Link>
            <div className="card-cuerpo">
              {r.categoria && <span className="etiqueta">{r.categoria}</span>}
              <h3>
                <Link to={`/productos/${r.productoId}`}>{r.nombre}</Link>
              </h3>
              <p className="card-precio">{precio(r.precio)}</p>
              <p className="texto-suave">{r.motivo}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
