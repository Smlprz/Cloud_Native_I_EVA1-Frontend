import React from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { 
  alimentoPerro1, alimentoPerro2, salsaPerro, alimentoPerro3, 
  casaPerro, bolsoMascota, mascotasHero 
} from '../../hooks/useCarrito';
import './Inicio.css';

const Inicio = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onDetalleProducto, onCarritoClick }) => {
  const { agregarAlCarrito } = useCarrito();

  const productos = [
    {
      id: 'alimento-perro-adulto-champion',
      nombre: "Alimento para Perro Adulto Carne y Pollo 15 kg",
      precio: 20990,
      imagen: alimentoPerro1
    },
    {
      id: 'alimento-perro-adulto-cachupin',
      nombre: "Alimento para Perro Adulto Carne 25 kg",
      precio: 41990,
      imagen: alimentoPerro2
    },
    {
      id: 'salsa-perro',
      nombre: "Salsa para perro carne al jugo 300gr",
      precio: 1990,
      imagen: salsaPerro
    },
    {
      id: 'alimento-perro-adulto-3kg',
      nombre: "Alimento para Perro Adulto Carne pollo y vegetales 3 kg",
      precio: 8990,
      imagen: alimentoPerro3
    },
    {
      id: 'casa-perro',
      nombre: "Casa de Perro 81.5x78.5x87.7 cm talla L",
      precio: 49990,
      imagen: casaPerro
    },
    {
      id: 'bolso-mascota',
      nombre: "Bolso Transportador Para Mascota Gato Perros Multifuncional",
      precio: 39990,
      imagen: bolsoMascota
    }
  ];

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
            producto={producto}
            onAgregarCarrito={agregarAlCarrito}
            onVerDetalle={() => onDetalleProducto(producto.id)}
          />
        ))}
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