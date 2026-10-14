import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msal, iniciarMsal, limpiarEstadoInteraccion } from './msal';
import { SCOPES, azureConfigurado } from '../config';
import api from '../api/client';

/**
 * Sesion con Microsoft Entra ID (Authorization Code + PKCE por redireccion).
 *   login()    -> va a Microsoft (siempre muestra el selector de cuenta)
 *   logout()   -> cierra la sesion SOLO en este navegador (sin redireccion, sin errores)
 *   getToken() -> access token vigente; si caduco y requiere interaccion, vuelve a Microsoft
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [listo, setListo] = useState(false);
  const [cuenta, setCuenta] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    let activo = true;
    iniciarMsal()
      .then((c) => activo && setCuenta(c))
      .finally(() => activo && setListo(true));
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async () => {
    if (!azureConfigurado) return;
    const pedir = () => msal.loginRedirect({ scopes: SCOPES, prompt: 'select_account' });
    try {
      await pedir();
    } catch (error) {
      if (error && error.errorCode === 'interaction_in_progress') {
        limpiarEstadoInteraccion();
        await pedir();
      } else {
        throw error;
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const actual = msal.getActiveAccount();
    try {
      // onRedirectNavigate => false: limpia la sesion local y NO redirige a Microsoft.
      await msal.logoutRedirect({ account: actual, onRedirectNavigate: () => false });
    } catch (e) {
      limpiarEstadoInteraccion();
    }
    setCuenta(null);
    setPerfil(null);
    window.location.assign('/');
  }, []);

  const getToken = useCallback(async () => {
    const account = msal.getActiveAccount();
    if (!account) throw new Error('Inicia sesion para continuar');
    try {
      const respuesta = await msal.acquireTokenSilent({ scopes: SCOPES, account });
      return respuesta.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await msal.acquireTokenRedirect({ scopes: SCOPES, account });
        throw new Error('Renovando la sesion...');
      }
      throw error;
    }
  }, []);

  // Perfil y roles desde ms-auth (ademas deja registrado el acceso en su auditoria).
  useEffect(() => {
    let activo = true;
    if (!cuenta) {
      setPerfil(null);
      return undefined;
    }
    getToken()
      .then((token) => api.auth.perfil(token))
      .then((p) => activo && setPerfil(p))
      .catch((error) => console.warn('No se pudo obtener el perfil:', error.message));
    return () => {
      activo = false;
    };
  }, [cuenta, getToken]);

  const valor = useMemo(() => {
    const roles = perfil && perfil.roles ? perfil.roles : [];
    return {
      listo,
      azureConfigurado,
      autenticado: Boolean(cuenta),
      nombre: (perfil && perfil.nombre) || (cuenta && (cuenta.name || cuenta.username)) || '',
      email: (perfil && perfil.email) || (cuenta && cuenta.username) || '',
      roles,
      tieneRol: (...requeridos) => requeridos.some((r) => roles.includes(r)),
      login,
      logout,
      getToken,
    };
  }, [listo, cuenta, perfil, login, logout, getToken]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
