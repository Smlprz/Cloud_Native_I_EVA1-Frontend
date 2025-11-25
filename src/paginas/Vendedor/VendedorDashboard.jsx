// VendedorDashboard.jsx - ACTUALIZADO CON LOGO
import React, { useState, useEffect } from 'react';
import { vendedorAPI } from '../../utils/api';
import { logo } from '../../hooks/useCarrito'; // Importar logo existente
import './VendedorDashboard.css';

const VendedorDashboard = ({ onNavigate }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await vendedorAPI.obtenerEstadisticas();
      if (response.success) {
        setEstadisticas(response.data);
      }
    } catch (err) {
      setError('Error al cargar estadísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="vendedor-dashboard">
      <div className="dashboard-header">
        <img src={logo} alt="Logo Tienda Mascotas" className="header-logo" />
        <h1>Panel de Vendedor</h1>
        <p>Bienvenido {user.nombre || user.username}, gestiona tus productos y ventas</p>
      </div>

      <div className="welcome-section">
        <h2>¡Hola {user.nombre || user.username}! 👋</h2>
        <p>Gestiona tu inventario y mantén tus productos actualizados</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3>Total Productos</h3>
            <span className="metric-value">{estadisticas?.totalProductos || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-info">
            <h3>Stock Bajo</h3>
            <span className="metric-value warning">{estadisticas?.stockBajo || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3>Valor Inventario</h3>
            <span className="metric-value">
              ${estadisticas?.valorInventario?.toLocaleString() || '0'}
            </span>
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
      </div>

      <div className="quick-stats">
        <h3>📊 Resumen Rápido</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span>Productos Activos:</span>
            <strong>{estadisticas?.productos || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Necesita Re-stock:</span>
            <strong className="warning">{estadisticas?.stockBajo || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Valor Total:</span>
            <strong className="success">${estadisticas?.valorInventario?.toLocaleString() || '0'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendedorDashboard;