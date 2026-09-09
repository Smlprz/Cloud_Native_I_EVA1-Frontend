import React, { useState } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import './Checkout.css';

/**
 * Checkout simple: muestra el resumen y confirma la compra contra el backend real
 * (POST /api/carrito/checkout en ms-carrito). Sin formulario de datos.
 */
const Checkout = ({
  onLoginClick,
  onProductosClick,
  onNosotrosClick,
  onBlogsClick,
  onContactoClick,
}) => {
  const { carrito, totalPrecio, checkout } = useCarrito();

  const [estado, setEstado] = useState(null); // null | 'exitoso' | 'fallido'
  const [procesando, setProcesando] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');

  const cabecera = (
    <Encabezado
      onLoginClick={onLoginClick}
      onProductosClick={onProductosClick}
      onNosotrosClick={onNosotrosClick}
      onBlogsClick={onBlogsClick}
      onContactoClick={onContactoClick}
      onCarritoClick={() => {}}
    />
  );

  const confirmar = async () => {
    setProcesando(true);
    setError('');
    try {
      const p = await checkout(); // POST /api/carrito/checkout
      setPedido(p);
      setEstado('exitoso');
    } catch (e) {
      console.error('Error al confirmar el pedido:', e);
      setError(e.message || 'Error desconocido');
      setEstado('fallido');
    } finally {
      setProcesando(false);
    }
  };

  const clp = (n) => `$${Number(n || 0).toLocaleString('es-CL')}`;

  // ---- Compra exitosa ----
  if (estado === 'exitoso' && pedido) {
    return (
      <div className="checkout-page">
        {cabecera}
        <main className="checkout-main">
          <div className="checkout-container">
            <div className="estado-pago exito">
              <div className="estado-icon">✅</div>
              <h2>¡Compra confirmada!</h2>
              <p className="numero-orden">Pedido N° {pedido.id}</p>
              <p className="codigo-orden">Estado: {pedido.estado}</p>
            </div>

            <div className="resumen-section">
              <h2 className="section-title">Detalle del pedido</h2>
              <div className="table-container">
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((it) => (
                      <tr key={it.productoId}>
                        <td>{it.nombreProducto}</td>
                        <td>{clp(it.precioUnitario)}</td>
                        <td className="cantidad-cell">{it.cantidad}</td>
                        <td className="subtotal-cell">{clp(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="total-final-section">
                <div className="total-line">
                  <span><strong>Total:</strong></span>
                  <span className="total-amount">{clp(pedido.total)}</span>
                </div>
              </div>
            </div>

            <div className="acciones-section">
              <button className="btn-procesar-pago" onClick={onProductosClick}>
                Seguir comprando
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---- Carrito vacío ----
  if (carrito.length === 0) {
    return (
      <div className="checkout-page">
        {cabecera}
        <div className="carrito-vacio-checkout">
          <h2>Tu carrito está vacío</h2>
          <button className="btn-volver-productos" onClick={onProductosClick}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  // ---- Resumen + confirmar ----
  return (
    <div className="checkout-page">
      {cabecera}
      <main className="checkout-main">
        <div className="checkout-container">
          {estado === 'fallido' && (
            <div className="estado-pago error">
              <div className="estado-icon">❌</div>
              <h2>No se pudo completar la compra</h2>
              <p className="mensaje-error">{error}</p>
            </div>
          )}

          <div className="resumen-section">
            <h2 className="section-title">Resumen de tu compra</h2>
            <div className="table-container">
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((p, i) => (
                    <tr key={`${p.id}-${i}`}>
                      <td className="producto-info-cell">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="producto-imagen-table"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60?text=Producto';
                          }}
                        />
                        <span className="producto-nombre">{p.nombre}</span>
                      </td>
                      <td>{clp(p.precio)}</td>
                      <td className="cantidad-cell">{p.cantidad || 1}</td>
                      <td className="subtotal-cell">{clp((p.precio || 0) * (p.cantidad || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="total-final-section">
              <div className="total-line">
                <span><strong>Total:</strong></span>
                <span className="total-amount">{clp(totalPrecio)}</span>
              </div>
            </div>
          </div>

          <div className="acciones-section">
            <div className="acciones-pago">
              <button
                className="btn-procesar-pago"
                onClick={confirmar}
                disabled={procesando}
              >
                {procesando ? 'Procesando…' : `Confirmar compra ${clp(totalPrecio)}`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
