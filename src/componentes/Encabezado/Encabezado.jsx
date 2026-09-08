import React, { useState } from 'react';
import Carrito from '../Carrito/Carrito';
import { logo, carritoIcon } from '../../hooks/useCarrito';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import './Encabezado.css';

const Encabezado = ({
  onLoginClick,
  onProductosClick,
  onNosotrosClick,
  onBlogsClick,
  onContactoClick,
  onCarritoClick,
}) => {
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const { isAuthenticated, nombre, logout } = useAuth();
  const { carrito, eliminarDelCarrito, totalProductos } = useCarrito();

  const handleClick = (handler) => (e) => {
    e.preventDefault();
    if (handler) handler();
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  const handleVerCarritoCompleto = () => {
    setMostrarCarrito(false);
    if (onCarritoClick) onCarritoClick();
  };

  return (
    <header>
      <div className="logo">
        <img src={logo} alt="Logo Tienda Mascotas" />
      </div>

      <nav>
        <a href="#home" onClick={handleHomeClick}>Home</a>
        <a href="#productos" onClick={handleClick(onProductosClick)}>Productos</a>
        <a href="#nosotros" onClick={handleClick(onNosotrosClick)}>Nosotros</a>
        <a href="#blogs" onClick={handleClick(onBlogsClick)}>Blogs</a>
        <a href="#contacto" onClick={handleClick(onContactoClick)}>Contacto</a>
      </nav>

      <div className="header-buttons">
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="welcome-message">Hola, {nombre}!</span>
            <button className="logout-btn" onClick={logout}>
              Cerrar Sesion
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            Iniciar Sesion
          </button>
        )}

        <div className="cart" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
          <img src={carritoIcon} alt="Carrito de compras" className="cart-icon" />
          {totalProductos > 0 && <span className="cart-count">{totalProductos}</span>}

          {mostrarCarrito && (
            <Carrito
              carrito={carrito}
              eliminarDelCarrito={eliminarDelCarrito}
              onCerrar={() => setMostrarCarrito(false)}
              onVerCarritoCompleto={handleVerCarritoCompleto}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Encabezado;
