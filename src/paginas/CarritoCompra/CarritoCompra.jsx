import React, { useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import './CarritoCompra.css';

const CarritoCompra = ({ 
  onLoginClick, 
  onProductosClick, 
  onNosotrosClick, 
  onBlogsClick, 
  onContactoClick,
  onCarritoClick,
  onBack 
}) => {
  const { 
    carrito, 
    eliminarDelCarrito, 
    cambiarCantidad, 
    totalPrecio,
    totalProductos 
  } = useCarrito();

  useEffect(() => {
    console.log('CarritoCompra - Carrito actual:', carrito);
    console.log('CarritoCompra - Total productos:', totalProductos);
  }, [carrito, totalProductos]);

  const handleAplicarCupon = () => {
    alert('Cupón aplicado (funcionalidad en desarrollo)');
  };

  const handlePagar = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    

    if (onCarritoClick) {
      onCarritoClick();
    }
  };

  return (
    <div className="pagina-carrito">
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={() => {}}
      />

      <main className="carrito-main">
        <section className="productos-carrito">
          <h2>Mi carrito de compras</h2>
          
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>No hay productos en el carrito</p>
              <button 
                className="btn-volver-productos"
                onClick={onProductosClick}
              >
                Ver Productos
              </button>
            </div>
          ) : (
            carrito.map((producto, idx) => {
              const subtotal = (producto.precio || 0) * (producto.cantidad || 1);
              return (
                <div key={`${producto.id}-${idx}`} className="producto-carrito">
                  <div className="producto-imagen">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120x120?text=Imagen+No+Disponible';
                      }}
                    />
                  </div>
                  <div className="producto-info">
                    <h3>{producto.nombre || 'Producto sin nombre'}</h3>
                    <p className="producto-descripcion">
                      {producto.descripcion || 'Producto de calidad para tu mascota'}
                    </p>
                    <p className="producto-precio-unitario">
                      Precio unitario: ${(producto.precio || 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="producto-precio">
                    <span className="precio">${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="cantidad-controls">
                    <button 
                      onClick={() => cambiarCantidad(idx, -1)}
                      className="btn-cantidad"
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      value={producto.cantidad || 1} 
                      readOnly 
                      className="input-cantidad"
                    />
                    <button 
                      onClick={() => cambiarCantidad(idx, 1)}
                      className="btn-cantidad"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => eliminarDelCarrito(idx)}
                    className="btn-eliminar"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })
          )}
        </section>

        {carrito.length > 0 && (
          <aside className="resumen-compra">
            <h3 id="total-carrito">TOTAL: ${totalPrecio.toLocaleString('es-CL')}</h3>
            <div className="cupon-section">
              <input 
                type="text" 
                placeholder="Ingrese el cupón de descuento"
                className="input-cupon"
              />
              <button 
                onClick={handleAplicarCupon}
                className="btn-aplicar"
              >
                APLICAR
              </button>
            </div>
            <button 
              onClick={handlePagar} 
              className="btn-pagar"
            >
              PAGAR
            </button>
            <button 
              onClick={onProductosClick}
              className="btn-seguir-comprando"
            >
              Seguir Comprando
            </button>
          </aside>
        )}
      </main>
    </div>
  );
};

export default CarritoCompra;