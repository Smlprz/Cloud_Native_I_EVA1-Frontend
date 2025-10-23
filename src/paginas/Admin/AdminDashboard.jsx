import React from 'react';
import Sidebar from '../../componentes/Admin/Sidebar';
import Topbar from '../../componentes/Admin/Topbar';
import './Admin.css';

const AdminDashboard = ({ onNavigate, currentPage }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  React.useEffect(() => {
    if (!isAdmin) {
      alert('Acceso restringido a administradores.');
      onNavigate('inicio');
    }
  }, [isAdmin, onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUser');
    onNavigate('inicio');
  };

  const handleNewUser = () => {
    onNavigate('admin-usuarios');
  };

  const activities = [
    { fecha: '2025-09-01', evento: 'Nuevo pedido', usuario: 'cliente123' },
    { fecha: '2025-09-01', evento: 'Registro usuario', usuario: 'juan.p' },
    { fecha: '2025-09-02', evento: 'Producto agregado', usuario: 'admin' },
    { fecha: '2025-09-03', evento: 'Stock actualizado', usuario: 'bodega1' },
  ];

  if (!isAdmin) return null;

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

        <div className="card">
          <h3>Panel principal</h3>
          <p>Resumen rápido (datos de ejemplo).</p>
          <div className="grid">
            <div className="card">
              <strong>Ventas hoy</strong>
              <div style={{ fontSize: '22px', marginTop: '8px' }}>$54.550.000</div>
            </div>
            <div className="card">
              <strong>Pedidos pendientes</strong>
              <div style={{ fontSize: '22px', marginTop: '8px' }}>18</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Actividades recientes</h3>
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
              {activities.map((activity, index) => (
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