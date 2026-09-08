import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { msalInstance, loginRequest, azureConfigurado } from '../authConfig';
import { authAPI } from '../utils/api';

/**
 * Contexto de autenticacion basado en MSAL (Azure AD / Microsoft Entra ID).
 * Flujo Authorization Code + PKCE mediante redireccion.
 *  - login()    -> redirige a Microsoft para iniciar sesion
 *  - logout()   -> cierra sesion
 *  - getToken() -> devuelve un access token valido para llamar a la API (se adjunta como Bearer)
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [listo, setListo] = useState(false);
  const [cuenta, setCuenta] = useState(null);
  const [perfil, setPerfil] = useState(null); // { id, nombre, email, roles, scopes } desde ms-auth

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        await msalInstance.initialize();
        const resultado = await msalInstance.handleRedirectPromise();
        if (resultado && resultado.account) {
          msalInstance.setActiveAccount(resultado.account);
        }
        const activa =
          msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
        if (activa) msalInstance.setActiveAccount(activa);
        if (activo) setCuenta(activa);
      } catch (error) {
        console.error('Error inicializando MSAL:', error);
      } finally {
        if (activo) setListo(true);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(() => {
    if (!azureConfigurado) {
      alert(
        'Azure AD todavia no esta configurado.\n' +
          'Completa frontend/.env con los datos del Tenant (ver docs/AZURE-AD-SETUP.md).'
      );
      return;
    }
    // prompt: 'select_account' -> siempre muestra el selector de cuenta de Microsoft,
    // aunque ya haya una sesion abierta en el navegador (permite cambiar de cuenta).
    msalInstance.loginRedirect({ ...loginRequest, prompt: 'select_account' });
  }, []);

  // Cierre de sesion "local": limpia el token/cuenta de MSAL y vuelve al inicio,
  // sin redirigir a la pagina de logout de Microsoft (evita el error
  // interaction_in_progress y deja la app en un estado limpio).
  const logout = useCallback(async () => {
    try {
      await msalInstance.clearCache();
    } catch (e) {
      /* algunas versiones no exponen clearCache */
    }
    try {
      msalInstance.setActiveAccount(null);
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('msal.') || k.includes('login.windows.net') || k.includes(msalInstance.getConfiguration().auth.clientId))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch (e) {
      /* ignore */
    }
    window.location.assign(window.location.origin);
  }, []);

  const getToken = useCallback(async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      throw new Error('No hay sesion iniciada');
    }
    const respuesta = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    try {
      const p = JSON.parse(
        atob(respuesta.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      // eslint-disable-next-line no-console
      console.log('[JWT DEBUG]', {
        aud: p.aud,
        iss: p.iss,
        ver: p.ver,
        tid: p.tid,
        scp: p.scp,
        roles: p.roles,
        appid: p.appid || p.azp,
      });
    } catch (e) {
      /* token no legible */
    }
    return respuesta.accessToken;
  }, []);

  // Tras iniciar sesion: pide el perfil al microservicio de identidad (ms-auth).
  // Esto ademas deja registrado el acceso en la BD de auditoria de ms-auth.
  useEffect(() => {
    let activo = true;
    if (!cuenta) {
      setPerfil(null);
      return undefined;
    }
    (async () => {
      try {
        const token = await getToken();
        const p = await authAPI.me(token);
        if (activo) setPerfil(p);
      } catch (error) {
        console.error('No se pudo obtener el perfil desde ms-auth:', error);
      }
    })();
    return () => {
      activo = false;
    };
  }, [cuenta, getToken]);

  const value = {
    listo,
    isAuthenticated: Boolean(cuenta),
    cuenta,
    nombre: perfil?.nombre || (cuenta ? cuenta.name || cuenta.username : 'Usuario'),
    perfil,
    roles: perfil?.roles || [],
    azureConfigurado,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return contexto;
};
