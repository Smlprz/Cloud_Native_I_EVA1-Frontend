import React from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER, resolverImagen } from '../utils/imagenes';
import { precio } from '../utils/formato';

export default function ProductCard({ producto, onAgregar, deshabilitado }) {
  const agotado = producto.stock <= 0;
  return (
    <article className="card">
      <Link to={`/productos/${producto.id}`} className="card-imagen">
        <img
          src={resolverImagen(producto.imagenUrl)}
          alt={producto.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </Link>
      <div className="card-cuerpo">
        {producto.categoria && <span className="etiqueta">{producto.categoria}</span>}
        <h3>
          <Link to={`/productos/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        <p className="card-precio">{precio(producto.precio)}</p>
        <button
          type="button"
          className="btn btn-bloque"
          disabled={agotado || deshabilitado}
          onClick={() => onAgregar(producto)}
        >
          {agotado ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}
