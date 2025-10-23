import React from 'react';
import Sidebar from '../../componentes/Admin/Sidebar';
import Topbar from '../../componentes/Admin/Topbar';
import './Admin.css';

const AdminUsers = ({ onNavigate, currentPage }) => {
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
    alert('Agregar usuario (simulado)');
  };

  const fakeUsers = [
    { date: '2025-08-01', user: 'XxPepitogamerxX', name: 'Osama B', email: 'BinLaden@demo.com', status: 'Activo' },
    { date: '2024-09-02', user: 'PanConPaltaidx', name: 'Gustavo', email: 'Gustavo@demo.com', status: 'Pendiente' },
    { date: '2025-06-03', user: 'SeuMadruga', name: "Ramón", email: 'Ramon@demo.com', status: 'Cancelado' },
    { date: '2024-09-04', user: '_AlmaSoul_', name: 'Alexis', email: 'Sanchez@demo.com', status: 'Procesando' },
    { date: '2024-11-05', user: 'MomoBenavidez', name: 'Geronimo', email: 'Geronimo@demo.com', status: 'Activo' }
  ];

  if (!isAdmin) return null;

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="admin-main">
        <Topbar 
          title="Usuarios"
          onLogout={handleLogout}
          showNewUserButton={true}
          onNewUser={handleNewUser}
        />

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fakeUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.date}</td>
                  <td>{user.user}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>
                    <button onClick={() => alert(`Editar ${user.user}`)}>Editar</button>
                    <button onClick={() => alert(`Eliminar ${user.user}`)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;