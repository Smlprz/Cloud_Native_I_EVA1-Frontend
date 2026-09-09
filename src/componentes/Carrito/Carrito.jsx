import React from 'react';
import './Carrito.css';

const Carrito = ({ carrito, eliminarDelCarrito, onCerrar, onVerCarritoCompleto }) => {
  // 🆕 VALIDACIÓN CRÍTICA - Si carrito es undefined, usar array vacío
  const carritoItems = carrito || [];
  
  // 🆕 VALIDACIÓN en los cálculos
  const totalProductos = carritoItems.reduce((total, producto) => 
    total + ((producto && producto.cantidad) || 1), 0);
  
  const totalPrecio = carritoItems.reduce((total, producto) => {
    if (!producto) return total;
    const precio = producto.precio || 0;
    const cantidad = producto.cantidad || 1;
    return total + (precio * cantidad);
  }, 0);

  return (
    <div className="carrito-dropdown">
      <div className="carrito-header">
        <h3>Carrito de Compras</h3>
        <button className="btn-cerrar" onClick={onCerrar}>×</button>
      </div>
      
      <div className="carrito-content">
        {carritoItems.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <>
            <div className="carrito-items">
              {carritoItems.map((producto, index) => {
                // 🆕 VALIDACIÓN para cada producto
                if (!producto) return null;
                
                return (
                  <div key={`${producto.id}-${index}`} className="carrito-item">
                    <div className="item-info">
                      <img 
                        src={producto.imagen || ''} 
                        alt={producto.nombre || 'Producto'} 
                        className="item-imagen"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=Imagen';
                        }}
                      />
                      <div className="item-details">
                        <h4 className="item-nombre">
                          {producto.nombre && producto.nombre.length > 30 
                            ? producto.nombre.substring(0, 30) + '...' 
                            : producto.nombre || 'Producto sin nombre'
                          }
                        </h4>
                        <p className="item-precio">
                          ${(producto.precio || 0).toLocaleString('es-CL')} x {producto.cantidad || 1}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="btn-eliminar-item"
                      onClick={() => eliminarDelCarrito && eliminarDelCarrito(index)}
                      title="Eliminar producto"
                    >
                      ✖
                    </button>
                  </div>
                );
              })}
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
        {carritoItems.length > 0 && (
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