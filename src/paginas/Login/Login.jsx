import React, { useState } from 'react';
import { logo } from '../../hooks/useCarrito';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login = ({ onBack, onLoginSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();

  const USERCLI = 'Cliente321';
  const PASSCLI = '321123';
  const USERADM = 'admin';
  const PASSADM = 'root';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegister) {
      setErrorMessage('Cuenta creada exitosamente - Ya puedes iniciar sesión');
      setTimeout(() => {
        setIsRegister(false);
        setErrorMessage('');
      }, 2000);
    } else {
      if (username === USERCLI && password === PASSCLI) {
        login({ 
          username, 
          nombre: 'Cliente', 
          email: username + '@tiendamascotas.com' 
        }, false);
        setErrorMessage('¡Bienvenido Cliente!');
        setTimeout(() => {
          onLoginSuccess();
          onNavigate('inicio');
        }, 1000);
      } else if (username === USERADM && password === PASSADM) {
        login({ 
          username, 
          nombre: 'Administrador',
          email: 'admin@tiendamascotas.com'
        }, true);
        setErrorMessage('¡Bienvenido Administrador!');
        setTimeout(() => {
          onLoginSuccess();
          onNavigate('admin-dashboard');
        }, 1000);
      } else {
        setErrorMessage('Usuario o contraseña incorrectos');
      }
    }
    
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Logo Tienda Mascotas" className="login-logo" />
          <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Usuario:</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre de usuario" 
            required 
          />
          
          <label htmlFor="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña" 
            required 
          />

          {isRegister && (
            <>
              <label htmlFor="confirm-password">Confirmar Contraseña:</label>
              <input 
                type="password" 
                id="confirm-password" 
                placeholder="Confirma tu contraseña" 
                required 
              />
              
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Ingresa tu email" 
                required 
              />
            </>
          )}

          <button type="submit" className="submit-btn">
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-options">
          <button 
            type="button"
            className="switch-mode-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {errorMessage && (
          <p id="error-message" style={{ 
            color: errorMessage.includes('Bienvenido') || errorMessage.includes('creada') ? 'green' : 'red' 
          }}>
            {errorMessage}
          </p>
        )}

        <button className="back-home" onClick={onBack}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Login;