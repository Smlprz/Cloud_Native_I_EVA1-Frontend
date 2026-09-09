import React from 'react';
import './Admin.css';

const Topbar = ({ title, onLogout, showNewUserButton, onNewUser }) => {
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div>
        {showNewUserButton && (
          <button className="btn-new" onClick={onNewUser}>
            NUEVO USUARIO
          </button>
        )}
        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Topbar;