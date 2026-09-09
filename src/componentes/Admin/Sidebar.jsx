import React from 'react';
import './Admin.css';
import { logo } from '../../hooks/useCarrito';

const Sidebar = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'admin-dashboard', label: 'Dashboard' },
    { id: 'admin-usuarios', label: 'Usuarios' },
    { id: 'admin-productos', label: 'Productos' },
  ];

  return (
    <div className="sidebar">
      <img 
        src={logo}
        alt="Logo" 
        className="sidebar-logo"
      />
      <div className="menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;