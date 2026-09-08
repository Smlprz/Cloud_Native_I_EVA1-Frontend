import React from 'react';
import { PLACEHOLDER } from '../../utils/imagenes';
import './TarjetaProducto.css';

// Recibe un producto ya normalizado por formatProductForDisplay:
// { id, nombre, precio, descripcion, stock, categoria, imagen }
const TarjetaProducto = ({ producto, onAgregarCarrito, onVerDetalle }) => {
  const handleAgregarCarrito = (e) => {
    e.stopPropagation();
    onAgregarCarrito(producto);
  };

  return (
    <div className="tarjeta-producto" onClick={onVerDetalle}>
      <div className="producto-imagen-container">
        <img
          src={producto.imagen || PLACEHOLDER}
          alt={producto.nombre}
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
      </div>

      <div className="producto-info">
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-precio">
          ${producto.precio ? producto.precio.toLocaleString('es-CL') : '0'}
        </p>

        <button className="agregar-carrito-btn" onClick={handleAgregarCarrito}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default TarjetaProducto;
