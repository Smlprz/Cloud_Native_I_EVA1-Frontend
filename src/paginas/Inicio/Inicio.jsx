import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI, formatProductForDisplay } from '../../utils/api';
import { mascotasHero } from '../../hooks/useCarrito';
import './Inicio.css';

const Inicio = ({
  onLoginClick,
  onProductosClick,
  onNosotrosClick,
  onBlogsClick,
  onContactoClick,
  onDetalleProducto,
  onCarritoClick,
}) => {
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await productsAPI.getAll();
        setProductos(respuesta.slice(0, 6).map(formatProductForDisplay));
      } catch (err) {
        console.error('Error al cargar productos destacados:', err);
        setError('Error al cargar los productos destacados');
      }
    };
    cargar();
  }, []);

  return (
    <div className="pagina-inicio">
      <Encabezado
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />

      <div className="hero">
        <div className="text">
          <h1>TIENDA PARA MASCOTAS ONLINE</h1>
          <p>
            Descubre nuevos productos para tus queridas mascotas, desde las mejores
            comidas hasta accesorios y mas!
          </p>
          <button onClick={onProductosClick}>Ver productos</button>
        </div>
        <div className="image">
          <img src={mascotasHero} alt="Mascotas" />
        </div>
      </div>

      <section className="products" id="productos">
        {error && <p className="error-message">{error}</p>}
        {productos.map((producto) => (
          <TarjetaProducto
            key={producto.id}
            producto={producto}
            onAgregarCarrito={agregarAlCarrito}
            onVerDetalle={() => onDetalleProducto(producto.id)}
          />
        ))}

        {!error && productos.length === 0 && (
          <div className="no-products-message">
            <p>No hay productos destacados disponibles en este momento.</p>
            <button onClick={onProductosClick} className="view-all-button">
              Ver todos los productos
            </button>
          </div>
        )}
      </section>

      <footer>
        <div className="footer-info">
          <h3>Mi Tienda de Mascotas</h3>
          <p>Tu companero de confianza para el cuidado de tus mejores amigos</p>
          <div className="footer-categories">
            <a href="#alimentos">Alimentos</a>
            <a href="#accesorios">Accesorios</a>
            <a href="#juguetes">Juguetes</a>
            <a href="#salud">Salud &amp; Bienestar</a>
          </div>
        </div>

        <div className="newsletter">
          <h4>Unete a nuestra comunidad</h4>
          <p>Recibe ofertas exclusivas y tips para el cuidado de tu mascota</p>
          <div className="newsletter-form">
            <input type="email" placeholder="tucorreo@ejemplo.com" className="newsletter-input" />
            <button
              className="newsletter-btn"
              onClick={() => alert('Gracias por suscribirte!')}
            >
              Suscribirse
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Inicio;
