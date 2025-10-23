import React, { useState } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { 
  alimentoPerro1, alimentoPerro2, salsaPerro, alimentoPerro3, 
  casaPerro, bolsoMascota, contenedorComida, rascadorGato 
} from '../../hooks/useCarrito';
import './Productos.css';

const Productos = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onBack, onDetalleProducto, onCarritoClick }) => {
  const { agregarAlCarrito } = useCarrito();
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  const productos = [
    {
      id: 'alimento-perro-adulto-champion',
      nombre: "Alimento para Perro Adulto Carne y Pollo 15 kg",
      precio: 20990,
      imagen: alimentoPerro1,
      categoria: "alimentos"
    },
    {
      id: 'alimento-perro-adulto-cachupin',
      nombre: "Alimento para Perro Adulto Carne 25 kg",
      precio: 41990,
      imagen: alimentoPerro2,
      categoria: "alimentos"
    },
    {
      id: 'salsa-perro',
      nombre: "Salsa para perro carne al jugo 300gr",
      precio: 1990,
      imagen: salsaPerro,
      categoria: "alimentos"
    },
    {
      id: 'alimento-perro-adulto-3kg',
      nombre: "Alimento para Perro Adulto Carne pollo y vegetales 3 kg",
      precio: 8990,
      imagen: alimentoPerro3,
      categoria: "alimentos"
    },
    {
      id: 'casa-perro',
      nombre: "Casa de Perro 81.5x78.5x87.7 cm talla L",
      precio: 49990,
      imagen: casaPerro,
      categoria: "accesorios"
    },
    {
      id: 'bolso-mascota',
      nombre: "Bolso Transportador Para Mascota Gato Perros Multifuncional",
      precio: 39990,
      imagen: bolsoMascota,
      categoria: "accesorios"
    },
    {
      id: 'contenedor-comida',
      nombre: "Contenedor de comida para mascotas 20kg",
      precio: 16990,
      imagen: contenedorComida,
      categoria: "accesorios"
    },
    {
      id: 'rascador-gato',
      nombre: "Rascador para gato 137 cm",
      precio: 32990,
      imagen: rascadorGato,
      categoria: "accesorios"
    }
  ];

  const productosFiltrados = categoriaFiltro === 'todos' 
    ? productos 
    : productos.filter(producto => producto.categoria === categoriaFiltro);

  return (
    <div className="pagina-productos">
      {/* ENCABEZADO */}
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />

      <div className="productos-header">
        <h1>CATÁLOGO DE PRODUCTOS</h1>
        
        <div className="filtro-container">
          <label htmlFor="categoriaFiltro">Filtrar por:</label>
          <select 
            id="categoriaFiltro"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="todos">Todos los productos</option>
            <option value="alimentos">Alimentos</option>
            <option value="accesorios">Accesorios</option>
          </select>
        </div>
      </div>

      <section className="products-section">
        <h2>PRODUCTOS DISPONIBLES:</h2>
        <div className="products-grid">
          {productosFiltrados.map(producto => (
            <TarjetaProducto 
              key={producto.id}
              producto={producto}
              onAgregarCarrito={agregarAlCarrito}
              onVerDetalle={() => onDetalleProducto(producto.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Productos;