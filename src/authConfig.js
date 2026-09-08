import { PublicClientApplication } from '@azure/msal-browser';

// clientId real del App Registration SPA (lo entrega quien configura Azure).
// Si no esta seteado usamos un GUID ficticio para que MSAL no falle al construirse;
// `azureConfigurado` queda en false y la UI no dispara el login.
const clientIdEnv = process.env.REACT_APP_AZURE_CLIENT_ID || '';
const tenantId = process.env.REACT_APP_AZURE_TENANT_ID || 'common';

export const azureConfigurado = Boolean(clientIdEnv);

export const apiScopes = (process.env.REACT_APP_AZURE_API_SCOPES || '')
  .split(/\s+/)
  .filter(Boolean);

export const msalConfig = {
  auth: {
    clientId: clientIdEnv || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes que se piden al iniciar sesion y al pedir el access token para la API.
export const loginRequest = {
  scopes: apiScopes.length ? apiScopes : ['openid', 'profile'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
