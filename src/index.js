import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CarritoProvider } from './context/CarritoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
