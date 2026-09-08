import React, { useState, useEffect } from 'react';
import { vendedorAPI } from '../../utils/api';
import './VendedorDashboard.css';

const VendedorDashboard = ({ onNavigate, onLogout }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
     
      const [productosResponse, statsResponse] = await Promise.all([
        vendedorAPI.obtenerMisProductos(),
        vendedorAPI.obtenerEstadisticas()
      ]);

      if (productosResponse.success) {
        setProductos(productosResponse.data || []);
      }

      if (statsResponse && statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }
    } catch (err) {
      console.log('Error cargando datos, usando datos locales');

      const productosResponse = await vendedorAPI.obtenerMisProductos();
      if (productosResponse.success) {
        setProductos(productosResponse.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticasCompletas = () => {
    if (!productos.length) return null;

    const totalProductos = productos.length;
    const stockBajo = productos.filter(p => p.stockQuantity < 10).length;
    const sinStock = productos.filter(p => p.stockQuantity === 0).length;
    const valorInventarioTotal = productos.reduce((total, producto) => {
      return total + (producto.priceProduct * producto.stockQuantity);
    }, 0);
    
    const valorInventarioPromedio = valorInventarioTotal / totalProductos;
    const productosPorCategoria = productos.reduce((acc, producto) => {
      const categoria = producto.categoria || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    return {
      totalProductos,
      stockBajo,
      sinStock,
      valorInventarioTotal,
      valorInventarioPromedio,
      productosPorCategoria,
      categoriaMasPopular: Object.keys(productosPorCategoria).reduce((a, b) => 
        productosPorCategoria[a] > productosPorCategoria[b] ? a : b, 'N/A'
      )
    };
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('loggedUser');
      if (onLogout) {
        onLogout();
      }
    }
  };

  const statsCompletas = calcularEstadisticasCompletas();

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="vendedor-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Panel de Vendedor</h1>
          <p>Bienvenido {user.nombre || user.username}</p>
          <div className="user-stats">
            <span>📧 {user.email}</span>
            <span>🆔 ID: {user.id}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => onNavigate('inicio')}>
            🏠 Inicio
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="welcome-section">
        <h2>¡Hola {user.nombre || user.username}! 👋</h2>
        <p>Gestiona tus productos y ventas</p>
      </div>

      {/* ESTADÍSTICAS PRINCIPALES */}
      <div className="metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3>Mis Productos</h3>
            <span className="metric-value">{statsCompletas?.totalProductos || 0}</span>
            <p className="metric-subtitle">Total en inventario</p>
          </div>
        </div>

        <div className="metric-card inventory">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3>Valor Inventario</h3>
            <span className="metric-value">
              ${statsCompletas?.valorInventarioTotal?.toLocaleString('es-CL') || '0'}
            </span>
            <p className="metric-subtitle">Valor total en stock</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-info">
            <h3>Stock Bajo</h3>
            <span className="metric-value">{statsCompletas?.stockBajo || 0}</span>
            <p className="metric-subtitle">Productos con stock &lt; 10</p>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">🚫</div>
          <div className="metric-info">
            <h3>Sin Stock</h3>
            <span className="metric-value">{statsCompletas?.sinStock || 0}</span>
            <p className="metric-subtitle">Productos agotados</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-btn primary"
          onClick={() => onNavigate('vendedor-crear-producto')}
        >
          ➕ Agregar Nuevo Producto
        </button>
        
        <button 
          className="action-btn secondary"
          onClick={() => onNavigate('vendedor-productos')}
        >
          📦 Ver Mis Productos
        </button>

        <button 
          className="action-btn tertiary"
          onClick={() => onNavigate('productos')}
        >
          🛍️ Ver Tienda Principal
        </button>
      </div>

      {/* ESTADÍSTICAS DETALLADAS */}
      {statsCompletas && (
        <div className="detailed-stats">
          <div className="stats-column">
            <div className="quick-stats">
              <h3>📈 Resumen Rápido</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span>Valor Promedio por Producto:</span>
                  <strong>${statsCompletas.valorInventarioPromedio?.toFixed(2) || '0'}</strong>
                </div>
                <div className="stat-item">
                  <span>Categoría Más Popular:</span>
                  <strong className="success">{statsCompletas.categoriaMasPopular}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-column">
            <div className="distribution-stats">
              <h3>📊 Distribución por Categoría</h3>
              <div className="category-distribution">
                {Object.entries(statsCompletas.productosPorCategoria).map(([categoria, cantidad]) => (
                  <div key={categoria} className="category-item">
                    <span className="category-name">{categoria}</span>
                    <div className="category-bar">
                      <div 
                        className="category-fill" 
                        style={{width: `${(cantidad / statsCompletas.totalProductos) * 100}%`}}
                      ></div>
                    </div>
                    <span className="category-count">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTONES DE ACCIÓN RÁPIDA */}
      <div className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="quick-buttons">
          <button 
            className="quick-btn"
            onClick={() => onNavigate('vendedor-crear-producto')}
          >
            🆕 Producto Rápido
          </button>
          <button 
            className="quick-btn"
            onClick={() => onNavigate('vendedor-productos')}
          >
            📋 Ver Inventario
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendedorDashboard;