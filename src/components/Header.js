import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import logo from '../Img_productos/LogoPaginaweb.png';
import carritoIcono from '../Img_productos/CarritoCompraBlanco.png';

export default function Header() {
  const { listo, autenticado, nombre, roles, tieneRol, login, logout } = useAuth();
  const { cantidad } = useCarrito();

  return (
    <header className="header">
      <Link to="/" className="header-logo" aria-label="Inicio">
        <img src={logo} alt="Tienda de mascotas" />
      </Link>

      <nav className="header-nav" aria-label="Principal">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        {autenticado && <NavLink to="/pedidos">Mis pedidos</NavLink>}
        {tieneRol('VENDEDOR', 'ADMIN') && <NavLink to="/gestion">Gestion</NavLink>}
        {tieneRol('ADMIN') && <NavLink to="/rabbit">RabbitMQ</NavLink>}
      </nav>

      <div className="header-acciones">
        <Link to="/carrito" className="carrito-enlace" aria-label={`Carrito, ${cantidad} productos`}>
          <img src={carritoIcono} alt="" />
          {cantidad > 0 && <span className="carrito-contador">{cantidad}</span>}
        </Link>

        {!listo ? null : autenticado ? (
          <div className="usuario">
            <span className="usuario-nombre">
              {nombre}
              {roles.length > 0 && <small>{roles.join(' / ')}</small>}
            </span>
            <button type="button" className="btn btn-oscuro" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-oscuro" onClick={login}>
            Iniciar sesion
          </button>
        )}
      </div>
    </header>
  );
}
