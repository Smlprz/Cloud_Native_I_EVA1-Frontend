import { PublicClientApplication } from '@azure/msal-browser';
import { AZURE } from '../config';

// Si no hay clientId usamos un GUID ficticio para que MSAL no falle al construirse;
// la UI detecta `azureConfigurado === false` y no intenta iniciar sesion.
export const msal = new PublicClientApplication({
  auth: {
    clientId: AZURE.clientId || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${AZURE.tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'localStorage' },
});

let inicio = null;

/**
 * Inicializa MSAL y procesa la vuelta de Microsoft UNA sola vez.
 * Es idempotente: React.StrictMode ejecuta los efectos dos veces en desarrollo y
 * llamar dos veces a handleRedirectPromise() es la causa tipica de login "buggeado".
 * Devuelve la cuenta activa (o null).
 */
export function iniciarMsal() {
  if (!inicio) {
    inicio = msal
      .initialize()
      .then(() => msal.handleRedirectPromise())
      .catch((error) => {
        // Estado de login corrupto (pestana cerrada a medias, etc.): se limpia y se sigue.
        console.warn('[msal] se limpio un login incompleto:', error && error.errorCode);
        limpiarEstadoInteraccion();
        return null;
      })
      .then((resultado) => {
        if (resultado && resultado.account) msal.setActiveAccount(resultado.account);
        const cuenta = msal.getActiveAccount() || msal.getAllAccounts()[0] || null;
        if (cuenta) msal.setActiveAccount(cuenta);
        return cuenta;
      });
  }
  return inicio;
}

/** Borra la marca "interaction_in_progress" que deja un login interrumpido. */
export function limpiarEstadoInteraccion() {
  try {
    Object.keys(window.sessionStorage)
      .filter((k) => k.includes('interaction.status'))
      .forEach((k) => window.sessionStorage.removeItem(k));
  } catch (e) {
    /* almacenamiento no disponible */
  }
}
