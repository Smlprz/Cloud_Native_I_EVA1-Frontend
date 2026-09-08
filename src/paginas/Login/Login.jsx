import React, { useEffect } from 'react';
import { logo } from '../../hooks/useCarrito';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

/**
 * Login corporativo con Azure AD (Microsoft Entra ID).
 * No hay formulario usuario/contrasena: la identidad se delega al IDaaS
 * mediante el flujo Authorization Code + PKCE (redireccion).
 */
const Login = ({ onBack, onLoginSuccess }) => {
  const { isAuthenticated, nombre, login, logout, azureConfigurado, listo } = useAuth();

  useEffect(() => {
    if (isAuthenticated && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Logo Tienda Mascotas" className="login-logo" />
          <h2>Iniciar Sesion</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
            La identidad se gestiona con <strong>Microsoft Entra ID (Azure AD)</strong>.
          </p>
        </div>

        {!azureConfigurado && (
          <p style={{ color: '#b8860b', textAlign: 'center', fontSize: '0.9rem' }}>
            Azure AD aun no esta configurado. Completa <code>frontend/.env</code> con los
            datos del Tenant (ver <code>docs/AZURE-AD-SETUP.md</code>).
          </p>
        )}

        {isAuthenticated ? (
          <>
            <p style={{ textAlign: 'center' }}>
              Sesion iniciada como <strong>{nombre}</strong>.
            </p>
            <button className="submit-btn" onClick={() => onLoginSuccess && onLoginSuccess()}>
              Continuar
            </button>
            <button className="switch-mode-btn" onClick={logout}>
              Cerrar sesion
            </button>
          </>
        ) : (
          <button className="submit-btn" onClick={login} disabled={!listo}>
            {listo ? 'Iniciar sesion con Microsoft' : 'Cargando...'}
          </button>
        )}

        <div className="login-options">
          <button type="button" className="switch-mode-btn" onClick={onBack}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
