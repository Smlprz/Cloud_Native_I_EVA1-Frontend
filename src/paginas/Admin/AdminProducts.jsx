import React, { useState, useEffect } from 'react';
import Sidebar from '../../componentes/Admin/Sidebar';
import Topbar from '../../componentes/Admin/Topbar';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminProducts = ({ onNavigate, currentPage }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagenUrl: ''
  });

  React.useEffect(() => {
    if (!isAdmin) {
      alert('Acceso restringido a administradores.');
      onNavigate('inicio');
    }
  }, [isAdmin, onNavigate]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosData = await adminAPI.getProductos();
      setProductos(productosData);
    } catch (err) {
      console.error('Error cargando productos:', err);
      alert('Error al cargar los productos');
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

  const handleNewProduct = () => {
    setEditingProduct(null);
    setNuevoProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagenUrl: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (producto) => {
    setEditingProduct(producto);
    setNuevoProducto({
      nombre: producto.nameProduct || producto.nombre,
      descripcion: producto.productDescription || producto.descripcion,
      precio: producto.priceProduct || producto.precio,
      stock: producto.stockQuantity || producto.stock,
      categoria: producto.categoria,
      imagenUrl: producto.imageLink || producto.imagenUrl
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNuevoProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagenUrl: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateProduct = async () => {
    try {
      if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      const productData = {
        nameProduct: nuevoProducto.nombre,
        productDescription: nuevoProducto.descripcion,
        priceProduct: parseFloat(nuevoProducto.precio),
        stockQuantity: parseInt(nuevoProducto.stock),
        categoria: nuevoProducto.categoria,
        imageLink: nuevoProducto.imagenUrl
      };

      if (editingProduct) {
        await adminAPI.actualizarProducto(editingProduct.idProduct, productData);
        alert('Producto actualizado exitosamente');
      } else {
        await adminAPI.crearProducto(productData);
        alert('Producto creado exitosamente');
      }

      await cargarProductos();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleDeleteProduct = async (producto) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto ${producto.nameProduct}?`)) {
      try {
        await adminAPI.eliminarProducto(producto.idProduct);
        await cargarProductos();
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="admin-main">
          <div className="loading-state">
            <h3>Cargando productos...</h3>
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
          title="Gestión de Productos"
          onLogout={handleLogout}
        />

        <div className="table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Todos los Productos</h3>
            <button className="btn-new" onClick={handleNewProduct}>
              NUEVO PRODUCTO
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.idProduct}>
                  <td>{producto.idProduct}</td>
                  <td>
                    <img 
                      src={producto.imageLink || producto.imagenUrl || 'https://via.placeholder.com/50x50/ff9443/ffffff?text=Prod'} 
                      alt={producto.nameProduct}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td>{producto.nameProduct || producto.nombre}</td>
                  <td>${(producto.priceProduct || producto.precio)?.toLocaleString('es-CL')}</td>
                  <td>{producto.stockQuantity || producto.stock}</td>
                  <td>{producto.categoria || 'Sin categoría'}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => handleEditProduct(producto)}
                        className="btn-action btn-edit"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(producto)}
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
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Descripción del producto"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={nuevoProducto.precio}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Precio del producto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={nuevoProducto.stock}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Cantidad en stock"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  value={nuevoProducto.categoria}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Categoría del producto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  name="imagenUrl"
                  value={nuevoProducto.imagenUrl}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleCloseModal}
                  className="btn-action btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="btn-action btn-confirm"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;