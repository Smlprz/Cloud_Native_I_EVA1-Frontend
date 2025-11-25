import React from 'react';
import './TarjetaProducto.css';

const TarjetaProducto = ({ producto, onAgregarCarrito, onVerDetalle }) => {
  // 🆕 FUNCIÓN ROBUSTA PARA IMÁGENES
  const obtenerImagenProducto = () => {
    // Prioridad 1: imageLink (que es el campo que SÍ tiene datos)
    if (producto.imageLink && producto.imageLink.startsWith('http')) {
      return producto.imageLink;
    }
    // Prioridad 2: imagen (para compatibilidad con carrito)
    else if (producto.imagen && producto.imagen.startsWith('http')) {
      return producto.imagen;
    }
    // Prioridad 3: imagenUrl (aunque está NULL en BD)
    else if (producto.imagenUrl && producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    // Prioridad 4: Fallback con placeholder
    else {
      const nombre = producto.nombre || producto.nameProduct || 'Producto';
      return `https://via.placeholder.com/300x300/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
    }
  };

  const handleAgregarCarrito = (e) => {
    e.stopPropagation();
    onAgregarCarrito(producto);
  };

  const handleVerDetalle = () => {
    if (onVerDetalle) {
      onVerDetalle();
    }
  };

  // 🆕 Obtener datos con compatibilidad
  const nombre = producto.nombre || producto.nameProduct;
  const precio = producto.precio || producto.priceProduct;

  return (
    <div className="tarjeta-producto" onClick={handleVerDetalle}>
      <div className="producto-imagen-container">
        <img 
          src={obtenerImagenProducto()} 
          alt={nombre}
          onError={(e) => {
            // Fallback en caso de error de carga
            const nombre = producto.nombre || producto.nameProduct || 'Producto';
            e.target.src = `https://via.placeholder.com/300x300/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
          }}
        />
      </div>
      
      <div className="producto-info">
        <h3 className="producto-nombre">{nombre}</h3>
        <p className="producto-precio">${precio ? precio.toLocaleString('es-CL') : '0'}</p>
        
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