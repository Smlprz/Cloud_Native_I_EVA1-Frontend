import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI, formatProductForDisplay } from '../../utils/api';
import './Productos.css';

const Productos = ({
  onLoginClick,
  onProductosClick,
  onNosotrosClick,
  onBlogsClick,
  onContactoClick,
  onDetalleProducto,
  onCarritoClick,
}) => {
  const { agregarAlCarrito } = useCarrito();
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const respuesta = await productsAPI.getAll();
        setProductos(respuesta.map(formatProductForDisplay));
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const productosFiltrados =
    categoriaFiltro === 'todos'
      ? productos
      : productos.filter((p) => p.categoria === categoriaFiltro);

  const cabecera = (
    <Encabezado
      onLoginClick={onLoginClick}
      onProductosClick={onProductosClick}
      onNosotrosClick={onNosotrosClick}
      onBlogsClick={onBlogsClick}
      onContactoClick={onContactoClick}
      onCarritoClick={onCarritoClick}
    />
  );

  if (loading) {
    return (
      <div className="pagina-productos">
        {cabecera}
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
        {cabecera}
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-productos">
      {cabecera}

      <div className="productos-header">
        <h1>CATALOGO DE PRODUCTOS</h1>

        <div className="filtro-container">
          <label htmlFor="categoriaFiltro">Filtrar por:</label>
          <select
            id="categoriaFiltro"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="todos">Todas las categorias</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="products-section">
        <h2>PRODUCTOS DISPONIBLES: {productosFiltrados.length}</h2>
        <div className="products-grid">
          {productosFiltrados.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onAgregarCarrito={agregarAlCarrito}
              onVerDetalle={() => onDetalleProducto(producto.id)}
            />
          ))}
        </div>
        {productosFiltrados.length === 0 && (
          <div className="no-products">
            <p>No se encontraron productos en esta categoria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Productos;
