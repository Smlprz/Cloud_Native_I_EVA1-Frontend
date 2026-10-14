import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../context/ToastContext';
import Estado from '../components/Estado';
import Resenas from '../components/Resenas';
import { PLACEHOLDER, resolverImagen } from '../utils/imagenes';
import { precio } from '../utils/formato';

export default function ProductDetail() {
  const { id } = useParams();
  const { datos: producto, cargando, error, recargar } = useCargar(() => api.productos.obtener(id), [id]);
  const { agregar, ocupado } = useCarrito();
  const { autenticado } = useAuth();
  const aviso = useToast();
  const [cantidad, setCantidad] = useState(1);

  if (cargando) return <Estado tipo="cargando" texto="Cargando producto..." />;
  if (error) {
    return (
      <Estado tipo="error" titulo="No se pudo cargar el producto" texto={error}
        accion={{ texto: 'Reintentar', onClick: recargar }} />
    );
  }
  if (!producto) return null;

  const sinStock = producto.stock <= 0;
  const cambiar = (valor) => {
    const n = Math.min(Math.max(1, valor), Math.max(1, producto.stock));
    if (valor > producto.stock) aviso.info(`Solo hay ${producto.stock} en stock`);
    setCantidad(n);
  };

  return (
    <section className="seccion">
      <Link to="/productos" className="volver">&larr; Volver a productos</Link>

      <div className="detalle">
        <img
          className="detalle-imagen"
          src={resolverImagen(producto.imagenUrl)}
          alt={producto.nombre}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="detalle-info">
          {producto.categoria && <span className="etiqueta">{producto.categoria}</span>}
          <h1>{producto.nombre}</h1>
          <p className="detalle-precio">{precio(producto.precio)}</p>
          <p>{producto.descripcion || 'Sin descripcion.'}</p>
          <p className={sinStock ? 'texto-error' : 'texto-suave'}>
            {sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
          </p>

          <div className="cantidad">
            <button type="button" aria-label="Menos" onClick={() => cambiar(cantidad - 1)} disabled={sinStock}>-</button>
            <span>{cantidad}</span>
            <button type="button" aria-label="Mas" onClick={() => cambiar(cantidad + 1)} disabled={sinStock}>+</button>
          </div>

          <button
            type="button"
            className="btn"
            disabled={sinStock || ocupado}
            onClick={() => agregar(producto, cantidad)}
          >
            {sinStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      <Resenas productoId={producto.id} autenticado={autenticado} />
    </section>
  );
}
