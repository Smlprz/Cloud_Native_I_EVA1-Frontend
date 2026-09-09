import React, { useState, useEffect } from 'react';
import { vendedorAPI } from '../../utils/api';
import './VendedorProductos.css';

const VendedorProductos = ({ onNavigate, onEditarProducto }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMisProductos();
  }, []);

  const cargarMisProductos = async () => {
    try {
      setLoading(true);
      const response = await vendedorAPI.obtenerMisProductos();
      if (response.success) {
        setProductos(response.data);
      }
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      return;
    }

    try {
      const response = await vendedorAPI.eliminarProducto(id);
      if (response.success) {
        alert('Producto eliminado exitosamente');
        cargarMisProductos();
      }
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="vendedor-productos">
      <div className="page-header">
        <h1>Mis Productos</h1>
        <button 
          className="btn-primary"
          onClick={() => onNavigate('vendedor-crear-producto')}
        >
          + Nuevo Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p>No tienes productos registrados</p>
          <button 
            className="btn-primary"
            onClick={() => onNavigate('vendedor-crear-producto')}
          >
            Crear Primer Producto
          </button>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map(producto => (
            <div key={producto.idProduct} className="producto-card">
              <div className="producto-image">
                <img 
                  src={producto.imageLink || producto.imagenUrl} 
                  alt={producto.nameProduct}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=Imagen+No+Disponible';
                  }}
                />
              </div>
              
              <div className="producto-info">
                <h3>{producto.nameProduct}</h3>
                <p className="producto-categoria">{producto.categoria}</p>
                <p className="producto-precio">${producto.priceProduct?.toLocaleString()}</p>
                <p className="producto-stock">
                  Stock: <span className={producto.stockQuantity < 10 ? 'stock-bajo' : ''}>
                    {producto.stockQuantity} unidades
                  </span>
                </p>
              </div>

              <div className="producto-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => onEditarProducto(producto.idProduct)}
                >
                  ✏️ Editar
                </button>
                
                <button 
                  className="btn-danger"
                  onClick={() => eliminarProducto(producto.idProduct, producto.nameProduct)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button 
          className="btn-back"
          onClick={() => onNavigate('sales-dashboard')}
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
};

export default VendedorProductos;