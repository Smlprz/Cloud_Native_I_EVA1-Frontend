import React, { useState, useEffect } from 'react';
import Sidebar from '../../componentes/Admin/Sidebar';
import Topbar from '../../componentes/Admin/Topbar';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminDashboard = ({ onNavigate, currentPage }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [estadisticas, setEstadisticas] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!isAdmin) {
      alert('Acceso restringido a administradores.');
      onNavigate('inicio');
    }
  }, [isAdmin, onNavigate]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      const [estadisticasData, actividadesData] = await Promise.all([
        adminAPI.getEstadisticas(),
        adminAPI.getActividades()
      ]);
      
      setEstadisticas(estadisticasData);
      setActividades(actividadesData);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUser');
    onNavigate('inicio');
  };

  const handleNewUser = () => {
    onNavigate('admin-usuarios');
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="admin-main">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h3>Cargando dashboard...</h3>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="admin-main">
        <Topbar 
          title="¡Bienvenido administrador!"
          onLogout={handleLogout}
          showNewUserButton={true}
          onNewUser={handleNewUser}
        />

        {error && (
          <div className="card" style={{ background: '#ffebee', borderColor: '#f44336' }}>
            <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>
          </div>
        )}

        <div className="card">
          <h3>Panel Principal - Estadísticas en Tiempo Real</h3>
          <p>Datos actualizados desde Oracle Cloud</p>
          <div className="grid">
            <div className="card">
              <strong>Total Usuarios</strong>
              <div style={{ fontSize: '22px', marginTop: '8px', color: '#ff9443' }}>
                {estadisticas?.totalUsuarios || 0}
              </div>
            </div>
            <div className="card">
              <strong>Total Productos</strong>
              <div style={{ fontSize: '22px', marginTop: '8px', color: '#4caf50' }}>
                {estadisticas?.totalProductos || 0}
              </div>
            </div>
            <div className="card">
              <strong>Productos Stock Bajo</strong>
              <div style={{ fontSize: '22px', marginTop: '8px', color: '#f44336' }}>
                {estadisticas?.productosBajoStock || 0}
              </div>
            </div>
            <div className="card">
              <strong>Pedidos Pendientes</strong>
              <div style={{ fontSize: '22px', marginTop: '8px', color: '#2196f3' }}>
                {estadisticas?.pedidosPendientes || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Actividades Recientes</h3>
            <button className="btn-new" onClick={handleNewUser}>
              NUEVO USUARIO
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Evento</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((activity, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px' }}>{activity.fecha}</td>
                  <td style={{ padding: '8px' }}>{activity.evento}</td>
                  <td style={{ padding: '8px' }}>{activity.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;