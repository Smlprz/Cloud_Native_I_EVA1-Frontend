import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useCarrito } from '../context/CarritoContext';
import RequireAuth from '../auth/RequireAuth';
import { useAuth } from '../auth/AuthContext';
import Estado from '../components/Estado';
import { PLACEHOLDER, resolverImagen } from '../utils/imagenes';
import { precio } from '../utils/formato';

function CartContent() {
  const { items, total, cargando, ocupado, cambiarCantidad, quitar, vaciar, confirmar } = useCarrito();
  const { datos: catalogo } = useCargar(() => api.productos.listar(), []);
  const [pedido, setPedido] = useState(null);
  const { email: emailCuenta } = useAuth();
  const [correo, setCorreo] = useState(null); // null = aun no editado: se usa el de la cuenta
  const navegar = useNavigate();
  const destino = (correo === null ? emailCuenta : correo).trim();
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino);

  const imagenes = {};
  (catalogo || []).forEach((p) => {
    imagenes[p.id] = p.imagenUrl;
  });

  const finalizar = async () => {
    const creado = await confirmar(destino);
    if (creado) setPedido({ ...creado, enviadoA: destino });
  };

  if (pedido) {
    return (
      <div className="confirmacion">
        <h1>Compra confirmada</h1>
        <p>Pedido N° <strong>{pedido.id}</strong> por <strong>{precio(pedido.total)}</strong>.</p>
        <p className="texto-suave">Enviaremos el comprobante a <strong>{pedido.enviadoA}</strong>.</p>
        <div className="acciones">
          <Link to="/pedidos" className="btn">Ver mis pedidos</Link>
          <Link to="/productos" className="btn btn-oscuro">Seguir comprando</Link>
        </div>
      </div>
    );
  }

  if (cargando) return <Estado tipo="cargando" texto="Cargando carrito..." />;

  if (items.length === 0) {
    return (
      <Estado tipo="info" titulo="Tu carrito esta vacio" texto="Agrega productos para comenzar."
        accion={{ texto: 'Ver productos', onClick: () => navegar('/productos') }} />
    );
  }

  return (
    <>
      <h1>Carrito</h1>
      <ul className="carrito-lista">
        {items.map((item) => (
          <li key={item.id} className="carrito-item">
            <img
              src={resolverImagen(imagenes[item.productoId])}
              alt={item.nombreProducto}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            <div className="carrito-item-info">
              <strong>{item.nombreProducto}</strong>
              <span className="texto-suave">{precio(item.precioUnitario)} c/u</span>
            </div>
            <div className="cantidad">
              <button type="button" aria-label="Menos" disabled={ocupado || item.cantidad <= 1}
                onClick={() => cambiarCantidad(item, item.cantidad - 1)}>-</button>
              <span>{item.cantidad}</span>
              <button type="button" aria-label="Mas" disabled={ocupado}
                onClick={() => cambiarCantidad(item, item.cantidad + 1)}>+</button>
            </div>
            <strong className="carrito-subtotal">{precio(item.subtotal)}</strong>
            <button type="button" className="btn-texto" disabled={ocupado} onClick={() => quitar(item)}>
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="comprobante">
        <label>
          Correo para el comprobante
          <input
            type="email"
            required
            maxLength="254"
            placeholder="tucorreo@ejemplo.com"
            value={correo === null ? emailCuenta : correo}
            onChange={(e) => setCorreo(e.target.value)}
            aria-invalid={!correoValido}
          />
        </label>
        {!correoValido && <span className="texto-error">Ingresa un correo valido</span>}
      </div>

      <div className="carrito-resumen">
        <button type="button" className="btn-texto" disabled={ocupado} onClick={vaciar}>
          Vaciar carrito
        </button>
        <div className="carrito-total">
          <span>Total</span>
          <strong>{precio(total)}</strong>
        </div>
        <button type="button" className="btn" disabled={ocupado || !correoValido} onClick={finalizar}>
          {ocupado ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </div>
    </>
  );
}

export default function Cart() {
  return (
    <section className="seccion">
      <RequireAuth>
        <CartContent />
      </RequireAuth>
    </section>
  );
}
