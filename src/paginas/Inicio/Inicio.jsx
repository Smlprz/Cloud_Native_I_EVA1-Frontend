import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI } from '../../utils/api';
import { mascotasHero } from '../../hooks/useCarrito';
import './Inicio.css';

const Inicio = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onDetalleProducto, onCarritoClick }) => {
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos destacados desde la base de datos
  useEffect(() => {
    const cargarProductosDestacados = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        console.log('Productos cargados desde BD para Inicio:', response);
        
        // Tomar solo los primeros 6 productos como destacados
        const productosDestacados = response.slice(0, 6);
        setProductos(productosDestacados);
      } catch (err) {
        console.error('Error al cargar productos destacados:', err);
        setError('Error al cargar los productos destacados');
      } finally {
        setLoading(false);
      }
    };

    cargarProductosDestacados();
  }, []);

  if (loading) {
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
            <p>Descubre nuevos productos para tus queridas mascotas, desde las mejores comidas hasta accesorios y más!</p>
            <button onClick={onProductosClick}>
              Ver productos
            </button>
          </div>
          <div className="image">
            <img src={mascotasHero} alt="Mascotas" />
          </div>
        </div>

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos destacados...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <p>Descubre nuevos productos para tus queridas mascotas, desde las mejores comidas hasta accesorios y más!</p>
            <button onClick={onProductosClick}>
              Ver productos
            </button>
          </div>
          <div className="image">
            <img src={mascotasHero} alt="Mascotas" />
          </div>
        </div>

        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-inicio">
      {/* ENCABEZADO SIMPLIFICADO */}
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
          <p>Descubre nuevos productos para tus queridas mascotas, desde las mejores comidas hasta accesorios y más!</p>
          <button onClick={onProductosClick}>
            Ver productos
          </button>
        </div>
        <div className="image">
          <img src={mascotasHero} alt="Mascotas" />
        </div>
      </div>

      <section className="products" id="productos">
        {productos.map(producto => (
          <TarjetaProducto 
            key={producto.id}
            producto={{
              ...producto,
              // Asegurar que el precio sea número y usar imagen correcta
              precio: typeof producto.precio === 'number' ? producto.precio : Number(producto.precio),
              imagen: producto.imagenUrl || producto.imagen
            }}
            onAgregarCarrito={agregarAlCarrito}
            onVerDetalle={() => onDetalleProducto(producto.id)}
          />
        ))}
        
        {productos.length === 0 && (
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
          <h3>🐾 Mi Tienda de Mascotas</h3>
          <p>Tu compañero de confianza para el cuidado de tus mejores amigos</p>
          <div className="footer-categories">
            <a href="#alimentos">Alimentos</a>
            <a href="#accesorios">Accesorios</a>
            <a href="#juguetes">Juguetes</a>
            <a href="#salud">Salud & Bienestar</a>
          </div>
        </div>
        
        <div className="newsletter">
          <h4>📧 Únete a nuestra comunidad</h4>
          <p>Recibe ofertas exclusivas y tips para el cuidado de tu mascota</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="tucorreo@ejemplo.com" 
              className="newsletter-input"
            />
            <button 
              className="newsletter-btn"
              onClick={() => {
                alert('🎉 ¡Gracias por suscribirte! Hemos enviado un correo de confirmación a tu email.');
              }}
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