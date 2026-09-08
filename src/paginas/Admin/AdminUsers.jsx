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
  const [editingUser, setEditingUser] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    username: '',
    password: '',
    telefono: '',
    direccion: '',
    run: '',
    dv: '0',
    userTypeId: 3
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
    setEditingUser(null);
    setNuevoUsuario({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      username: '',
      password: '',
      telefono: '',
      direccion: '',
      run: '',
      dv: '0',
      userTypeId: 3
    });
    setShowModal(true);
  };

  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setNuevoUsuario({
      nombre: usuario.nombre || '',
      apellidoPaterno: usuario.apellidoPaterno || '',
      apellidoMaterno: usuario.apellidoMaterno || '',
      email: usuario.email || '',
      username: usuario.username || '',
      password: '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      run: usuario.run || '',
      dv: usuario.dv || '0',
      userTypeId: usuario.userTypeId || 3
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNuevoUsuario({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      username: '',
      password: '',
      telefono: '',
      direccion: '',
      run: '',
      dv: '0',
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
      if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.username || !nuevoUsuario.password) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      const userData = {
        nombre: nuevoUsuario.nombre,
        apellidoPaterno: nuevoUsuario.apellidoPaterno || nuevoUsuario.nombre,
        apellidoMaterno: nuevoUsuario.apellidoMaterno || nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        username: nuevoUsuario.username,
        password: nuevoUsuario.password,
        telefono: nuevoUsuario.telefono || '',
        direccion: nuevoUsuario.direccion || '',
        run: nuevoUsuario.run ? parseInt(nuevoUsuario.run) : 25000000,
        dv: nuevoUsuario.dv || '0',
        userTypeId: parseInt(nuevoUsuario.userTypeId)
      };

      if (editingUser) {
        const response = await fetch(`http://localhost:8080/api/admin/usuarios/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          await cargarUsuarios();
          alert(`Usuario ${nuevoUsuario.username} actualizado exitosamente`);
        } else {
          throw new Error('Error al actualizar usuario');
        }
      } else {
        const response = await fetch('http://localhost:8080/api/admin/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          await cargarUsuarios();
          alert(`Usuario ${nuevoUsuario.username} creado exitosamente`);
        } else {
          throw new Error('Error al crear usuario');
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleDeleteUser = async (usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/usuarios/${usuario.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await cargarUsuarios();
          alert(`Usuario ${usuario.username} eliminado`);
        } else {
          throw new Error('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const getTipoUsuario = (userTypeId) => {
    switch(userTypeId) {
      case 1: return 'ADMIN';
      case 2: return 'VENDEDOR';
      case 3: return 'CLIENTE';
      default: return 'CLIENTE';
    }
  };

  const getBadgeClass = (userTypeId) => {
    switch(userTypeId) {
      case 1: return 'badge-admin';
      case 2: return 'badge-vendedor';
      case 3: return 'badge-cliente';
      default: return 'badge-cliente';
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="admin-main">
          <div className="loading-state">
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
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.username || 'N/A'}</td>
                  <td>{usuario.nombre} {usuario.apellidoPaterno}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(usuario.userTypeId)}`}>
                      {getTipoUsuario(usuario.userTypeId)}
                    </span>
                  </td>
                  <td>{usuario.telefono || 'N/A'}</td>
                  <td>
                    <span className="badge badge-activo">
                      Activo
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => handleEditUser(usuario)}
                        className="btn-action btn-edit"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(usuario)}
                        className="btn-action btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ marginTop: 0 }}>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoUsuario.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el nombre"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellido Paterno *</label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={nuevoUsuario.apellidoPaterno}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el apellido paterno"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellido Materno</label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  value={nuevoUsuario.apellidoMaterno}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el apellido materno"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={nuevoUsuario.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={nuevoUsuario.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={editingUser ? "Nueva contraseña" : "Ingresa la contraseña"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">RUN</label>
                <input
                  type="number"
                  name="run"
                  value={nuevoUsuario.run}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DV</label>
                <input
                  type="text"
                  name="dv"
                  value={nuevoUsuario.dv}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: 9"
                  maxLength="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={nuevoUsuario.telefono}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa el teléfono"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={nuevoUsuario.direccion}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingresa la dirección"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Usuario</label>
                <select
                  name="userTypeId"
                  value={nuevoUsuario.userTypeId}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value={3}>Cliente</option>
                  <option value={2}>Vendedor</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleCloseModal}
                  className="btn-action btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  className="btn-action btn-confirm"
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
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