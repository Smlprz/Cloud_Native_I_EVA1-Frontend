import React, { useState, useEffect } from 'react';
import Sidebar from '../../componentes/Admin/Sidebar';
import Topbar from '../../componentes/Admin/Topbar';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminUsers = ({ onNavigate, currentPage }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    telefono: '',
    direccion: '',
    userTypeId: 3 // Por defecto Cliente
  });

  React.useEffect(() => {
    if (!isAdmin) {
      alert('Acceso restringido a administradores.');
      onNavigate('inicio');
    }
  }, [isAdmin, onNavigate]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await adminAPI.getUsuarios();
      setUsuarios(usuariosData);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      alert('Error al cargar los usuarios');
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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoUsuario({
      nombre: '',
      apellido: '',
      email: '',
      username: '',
      password: '',
      telefono: '',
      direccion: '',
      userTypeId: 3
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async () => {
    try {
      // Validaciones básicas
      if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.username || !nuevoUsuario.password) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      // Aquí iría la llamada real al backend para crear usuario
      // Por ahora simulamos la creación
      const usuarioCreado = {
        id: Date.now(), // ID temporal
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        username: nuevoUsuario.username,
        telefono: nuevoUsuario.telefono,
        direccion: nuevoUsuario.direccion,
        tipoUsuario: nuevoUsuario.userTypeId === 1 ? 'ADMIN' : 
                    nuevoUsuario.userTypeId === 2 ? 'VENDEDOR' : 'CLIENTE',
        fechaRegistro: new Date().toISOString().split('T')[0],
        estado: 'Activo'
      };

      // Agregar a la lista local (en producción sería llamada API)
      setUsuarios(prev => [usuarioCreado, ...prev]);
      
      alert(`Usuario ${nuevoUsuario.username} creado exitosamente`);
      handleCloseModal();
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Error al crear el usuario');
    }
  };

  const handleEditUser = (usuario) => {
    alert(`Editar usuario: ${usuario.username} (Funcionalidad en desarrollo)`);
  };

  const handleDeleteUser = (usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
      // Eliminar de la lista local (en producción sería llamada API)
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
      alert(`Usuario ${usuario.username} eliminado`);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="admin-main">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h3>Cargando usuarios...</h3>
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
          title="Gestión de Usuarios"
          onLogout={handleLogout}
          showNewUserButton={true}
          onNewUser={handleNewUser}
        />

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr key={usuario.id || index}>
                  <td>{usuario.id}</td>
                  <td>{usuario.username || 'N/A'}</td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        usuario.tipoUsuario === 'ADMIN' ? '#ff9443' :
                        usuario.tipoUsuario === 'VENDEDOR' ? '#2196f3' : '#4caf50',
                      color: 'white'
                    }}>
                      {usuario.tipoUsuario || 'CLIENTE'}
                    </span>
                  </td>
                  <td>{usuario.telefono || 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: '#4caf50',
                      color: 'white'
                    }}>
                      Activo
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditUser(usuario)}
                      style={{
                        padding: '6px 12px',
                        margin: '2px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(usuario)}
                      style={{
                        padding: '6px 12px',
                        margin: '2px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para nuevo usuario */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginTop: 0 }}>Crear Nuevo Usuario</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoUsuario.nombre}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="Ingresa el nombre"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={nuevoUsuario.apellido}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="Ingresa el apellido"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={nuevoUsuario.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="Ingresa el email"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={nuevoUsuario.username}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="Ingresa el username"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="Ingresa la contraseña"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Tipo de Usuario
                </label>
                <select
                  name="userTypeId"
                  value={nuevoUsuario.userTypeId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value={3}>Cliente</option>
                  <option value={2}>Vendedor</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff9443',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Crear Usuario
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;