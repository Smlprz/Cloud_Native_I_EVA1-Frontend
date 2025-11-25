import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI, formatProductForDisplay } from '../../utils/api';
import './Productos.css';

const Productos = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onBack, onDetalleProducto, onCarritoClick }) => {
  const { agregarAlCarrito } = useCarrito();
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde la base de datos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        console.log('Productos cargados desde BD:', response);
        setProductos(response);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = categoriaFiltro === 'todos' 
    ? productos 
    : productos.filter(producto => producto.categoria === categoriaFiltro);

  if (loading) {
    return (
      <div className="pagina-productos">
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={onCarritoClick}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagina-productos">
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={onCarritoClick}
        />
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
        <h2>PRODUCTOS DISPONIBLES: {productosFiltrados.length}</h2>
        <div className="products-grid">
          {productosFiltrados.map(producto => (
            <TarjetaProducto 
              key={producto.idProduct}  // 🆕 Cambiar de producto.id a producto.idProduct
              producto={formatProductForDisplay(producto)}  // 🆕 FORMATEAR ANTES DE PASAR
              onAgregarCarrito={agregarAlCarrito}
              onVerDetalle={() => onDetalleProducto(producto.idProduct)}  // 🆕 Cambiar a idProduct
            />
          ))}
        </div>
        {productosFiltrados.length === 0 && (
          <div className="no-products">
            <p>No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Productos;