import React from 'react';
import './TarjetaProducto.css';

const TarjetaProducto = ({ producto, onAgregarCarrito, onVerDetalle }) => {
  const handleAgregarCarrito = (e) => {
    e.stopPropagation();
    onAgregarCarrito(producto);
  };

  const handleVerDetalle = () => {
    if (onVerDetalle) {
      onVerDetalle();
    }
  };

  return (
    <div className="tarjeta-producto" onClick={handleVerDetalle}>
      <div className="producto-imagen-container">
        <img src={producto.imagen} alt={producto.nombre} />
      </div>
      
      <div className="producto-info">
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-precio">${producto.precio.toLocaleString('es-CL')}</p>
        
        <button 
          className="agregar-carrito-btn"
          onClick={handleAgregarCarrito}
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default TarjetaProducto;