import React, { useState } from 'react';
import { CarritoProvider } from './context/CarritoContext';
import Inicio from './paginas/Inicio/Inicio';
import Productos from './paginas/Productos/Productos';
import Login from './paginas/Login/Login';
import Nosotros from './paginas/Nosotros/Nosotros';
import Blogs from './paginas/Blogs/Blogs';
import Contacto from './paginas/Contacto/Contacto';
import DetalleProducto from './paginas/DetalleProducto/DetalleProducto';
import CarritoCompra from './paginas/CarritoCompra/CarritoCompra';
import Checkout from './paginas/Checkout/Checkout';
import AdminDashboard from './paginas/Admin/AdminDashboard';
import AdminUsers from './paginas/Admin/AdminUsers';
import VendedorDashboard from './paginas/Vendedor/VendedorDashboard';
import VendedorProductos from './paginas/Vendedor/VendedorProductos';
import VendedorCrearProducto from './paginas/Vendedor/VendedorCrearProducto';
import VendedorEditarProducto from './paginas/Vendedor/VendedorEditarProducto';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const navegarADetalleProducto = (productoId) => {
    setProductoSeleccionado(productoId);
    setCurrentPage('detalle-producto');
  };

  const navegarAEditarProducto = (productoId) => {
    setProductoSeleccionado(productoId);
    setCurrentPage('vendedor-editar-producto');
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setCurrentPage('inicio');
    window.location.reload();
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <Login 
          onLoginSuccess={() => setCurrentPage('inicio')}
          onNavigate={setCurrentPage}
          onBack={() => setCurrentPage('inicio')}
        />;
      
      case 'sales-dashboard':
        return <VendedorDashboard 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />;
      case 'vendedor-productos':
        return <VendedorProductos 
          onNavigate={setCurrentPage}
          onEditarProducto={navegarAEditarProducto}
        />;
      case 'vendedor-crear-producto':
        return <VendedorCrearProducto 
          onNavigate={setCurrentPage}
        />;
      case 'vendedor-editar-producto':
        return <VendedorEditarProducto 
          onNavigate={setCurrentPage}
          productoId={productoSeleccionado}
        />;

      case 'productos':
        return <Productos 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          onDetalleProducto={navegarADetalleProducto}
          onCarritoClick={() => setCurrentPage('carrito')}
          onBack={() => setCurrentPage('inicio')}
        />;
      case 'nosotros':
        return <Nosotros 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          onCarritoClick={() => setCurrentPage('carrito')}
        />;
      case 'blogs':
        return <Blogs 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onContactoClick={() => setCurrentPage('contacto')}
          onCarritoClick={() => setCurrentPage('carrito')}
        />;
      case 'contacto':
        return <Contacto 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onCarritoClick={() => setCurrentPage('carrito')}
        />;
      case 'detalle-producto':
        return <DetalleProducto 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          productoId={productoSeleccionado}
          onBack={() => setCurrentPage('productos')}
          onDetalleProducto={navegarADetalleProducto}
          onCarritoClick={() => setCurrentPage('carrito')}
        />;
      case 'carrito':
        return <CarritoCompra 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          onCarritoClick={() => setCurrentPage('checkout')}
          onBack={() => setCurrentPage('productos')}
        />;
      case 'checkout':
        return <Checkout 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          onBack={() => setCurrentPage('carrito')}
        />;
      case 'admin-dashboard':
        return <AdminDashboard 
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />;
      case 'admin-usuarios':
        return <AdminUsers 
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />;
      case 'inicio':
      default:
        return <Inicio 
          onLoginClick={() => setCurrentPage('login')}
          onProductosClick={() => setCurrentPage('productos')}
          onNosotrosClick={() => setCurrentPage('nosotros')}
          onBlogsClick={() => setCurrentPage('blogs')}
          onContactoClick={() => setCurrentPage('contacto')}
          onDetalleProducto={navegarADetalleProducto}
          onCarritoClick={() => setCurrentPage('carrito')}
        />;
    }
  };

  return (
    <CarritoProvider>
      <div className="App">
        {renderPage()}
      </div>
    </CarritoProvider>
  );
}

export default App;