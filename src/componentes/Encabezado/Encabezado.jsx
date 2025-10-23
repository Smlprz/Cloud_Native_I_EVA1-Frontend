import React, { useState } from 'react';
import Carrito from '../Carrito/Carrito';
import { logo, carritoIcon } from '../../hooks/useCarrito';
import { useAuth } from '../../hooks/useAuth';
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
  const { isLoggedIn, loggedUser, logout } = useAuth();
  const { carrito, eliminarDelCarrito, totalProductos } = useCarrito();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleProductosClick = (e) => {
    e.preventDefault();
    if (onProductosClick) {
      onProductosClick();
    }
  };

  const handleNosotrosClick = (e) => {
    e.preventDefault();
    if (onNosotrosClick) {
      onNosotrosClick();
    }
  };

  const handleBlogsClick = (e) => {
    e.preventDefault();
    if (onBlogsClick) {
      onBlogsClick();
    }
  };

  const handleContactoClick = (e) => {
    e.preventDefault();
    if (onContactoClick) {
      onContactoClick();
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  const handleVerCarritoCompleto = () => {
    setMostrarCarrito(false);
    if (onCarritoClick) {
      onCarritoClick();
    }
  };

  return (
    <header>
      <div className="logo">
        <img src={logo} alt="Logo Tienda Mascotas" />
      </div>
      
      <nav>
        <a href="#home" onClick={handleHomeClick}>Home</a>
        <a href="#productos" onClick={handleProductosClick}>Productos</a>
        <a href="#nosotros" onClick={handleNosotrosClick}>Nosotros</a>
        <a href="#blogs" onClick={handleBlogsClick}>Blogs</a>
        <a href="#contacto" onClick={handleContactoClick}>Contacto</a>
      </nav>
      
      <div className="header-buttons">
        {isLoggedIn ? (
          <div className="user-menu">
            <span className="welcome-message">
              ¡Hola, {loggedUser?.nombre || 'Usuario'}!
            </span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <button 
            className="login-btn"
            onClick={handleLoginClick}
          >
            Iniciar Sesión
          </button>
        )}
        
        <div className="cart" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
          <img 
            src={carritoIcon} 
            alt="Carrito de compras" 
            className="cart-icon"
          />
          {totalProductos > 0 && (
            <span className="cart-count">
              {totalProductos}
            </span>
          )}
          
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