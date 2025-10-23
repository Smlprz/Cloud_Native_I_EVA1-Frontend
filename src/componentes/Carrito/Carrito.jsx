import React from 'react';
import './Carrito.css';

const Carrito = ({ carrito, eliminarDelCarrito, onCerrar, onVerCarritoCompleto }) => {
  const totalProductos = carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);
  const totalPrecio = carrito.reduce((total, producto) => total + (producto.precio * (producto.cantidad || 1)), 0);

  return (
    <div className="carrito-dropdown">
      <div className="carrito-header">
        <h3>Carrito de Compras</h3>
        <button className="btn-cerrar" onClick={onCerrar}>×</button>
      </div>
      
      <div className="carrito-content">
        {carrito.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <>
            <div className="carrito-items">
              {carrito.map((producto, index) => (
                <div key={`${producto.id}-${index}`} className="carrito-item">
                  <div className="item-info">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre} 
                      className="item-imagen"
                    />
                    <div className="item-details">
                      <h4 className="item-nombre">
                        {producto.nombre.length > 30 
                          ? producto.nombre.substring(0, 30) + '...' 
                          : producto.nombre
                        }
                      </h4>
                      <p className="item-precio">
                        ${producto.precio.toLocaleString('es-CL')} x {producto.cantidad || 1}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn-eliminar-item"
                    onClick={() => eliminarDelCarrito(index)}
                    title="Eliminar producto"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
            
            <div className="carrito-total">
              <div className="total-info">
                <span>Productos: {totalProductos}</span>
                <span className="total-precio">
                  Total: ${totalPrecio.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="carrito-footer">
        {carrito.length > 0 && (
          <button 
            className="btn-ver-carrito-completo"
            onClick={onVerCarritoCompleto}
          >
            Ver Carrito Completo
          </button>
        )}
        <button 
          className="btn-seguir-comprando"
          onClick={onCerrar}
        >
          Seguir Comprando
        </button>
      </div>
    </div>
  );
};

export default Carrito;