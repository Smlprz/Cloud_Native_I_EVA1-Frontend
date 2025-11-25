import React, { useState } from 'react';
import { logo } from '../../hooks/useCarrito';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login = ({ onBack, onLoginSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (isRegister) {
      // Lógica de registro (pendiente de implementar)
      setErrorMessage('Cuenta creada exitosamente - Ya puedes iniciar sesión');
      setTimeout(() => {
        setIsRegister(false);
        setErrorMessage('');
      }, 2000);
    } else {
      try {
        console.log('🔐 Intentando login con:', { username, password });
        
        // Llamada al backend Spring Boot
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password
          }),
        });

        console.log('📡 Respuesta del servidor:', response.status);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Datos recibidos:', data);

        if (data.success) {
          // Login exitoso - Usar userType del backend
          const userType = data.userType; // 1=Admin, 2=Vendedor, 3=Cliente
          const isAdminUser = data.isAdmin || userType === 1;
          
          const userData = {
            username: data.username,
            nombre: data.nombre || data.username,
            email: data.email,
            userId: data.userId,
            userType: userType
          };

          console.log('✅ Login exitoso:', userData, 'userType:', userType, 'isAdmin:', isAdminUser);
          
          // Usar el hook useAuth para guardar en localStorage
          login(userData, isAdminUser);
          
          setErrorMessage(`¡Bienvenido ${data.username}!`);
          
          setTimeout(() => {
            onLoginSuccess();
            // Navegar según el tipo de usuario
            if (userType === 1) {
              console.log('🔄 Navegando a admin-dashboard');
              onNavigate('admin-dashboard'); // Administrador
            } else if (userType === 2) {
              console.log('🔄 Navegando a sales-dashboard');
              onNavigate('sales-dashboard'); // Vendedor
            } else {
              console.log('🔄 Navegando a inicio');
              onNavigate('inicio'); // Cliente
            }
          }, 1000);
        } else {
          setErrorMessage(data.message || 'Usuario o contraseña incorrectos');
        }
      } catch (error) {
        console.error('❌ Error en login:', error);
        setErrorMessage('Error de conexión con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080');
      }
    }
    
    setIsLoading(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Logo Tienda Mascotas" className="login-logo" />
          <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          <p style={{color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem'}}>
            {!isRegister && (
              <>
                <strong>Usuarios de prueba:</strong><br/>
                👑 Admin: VIOYARZUNS / ADMIN321123<br/>
                👤 Cliente: SAPEREZ / CLIENT321123<br/>
                🛍️ Vendedor: TOLOPEZ / SALES321123
              </>
            )}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Usuario:</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: VIOYARZUNS" 
            required 
            disabled={isLoading}
          />
          
          <label htmlFor="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ej: ADMIN321123" 
            required 
            disabled={isLoading}
          />

          {isRegister && (
            <>
              <label htmlFor="confirm-password">Confirmar Contraseña:</label>
              <input 
                type="password" 
                id="confirm-password" 
                placeholder="Confirma tu contraseña" 
                required 
                disabled={isLoading}
              />
              
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Ingresa tu email" 
                required 
                disabled={isLoading}
              />
            </>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '🔐 Conectando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="login-options">
          <button 
            type="button"
            className="switch-mode-btn"
            onClick={() => setIsRegister(!isRegister)}
            disabled={isLoading}
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {errorMessage && (
          <p id="error-message" style={{ 
            color: errorMessage.includes('Bienvenido') || errorMessage.includes('creada') ? 'green' : 'red',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {errorMessage}
          </p>
        )}

        <button 
          className="back-home" 
          onClick={onBack}
          disabled={isLoading}
        >
          ← Volver al inicio
        </button>

        {/* Debug info */}
        <div style={{marginTop: '1rem', fontSize: '0.8rem', color: '#999', textAlign: 'center'}}>
          Backend: http://localhost:8080
        </div>
      </div>
    </div>
  );
};

export default Login;