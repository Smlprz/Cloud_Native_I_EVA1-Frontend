import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import RequireAuth from '../auth/RequireAuth';
import Estado from '../components/Estado';
import { precio } from '../utils/formato';

/**
 * Pagina a la que Webpay devuelve al usuario.
 *   token_ws  -> el pago termino: se confirma (commit).
 *   TBK_TOKEN -> el usuario lo anulo en Webpay.
 *   ninguno   -> el formulario expiro.
 */
function Retorno() {
  const { getToken } = useAuth();
  const [params] = useSearchParams();
  const anulado = params.get('TBK_TOKEN');
  const tokenWs = params.get('token_ws');
  const [estado, setEstado] = useState({ tipo: 'cargando', texto: 'Confirmando el pago con Webpay...' });
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true; // el commit se pide una sola vez
    if (!anulado && !tokenWs) {
      setEstado({ tipo: 'error', titulo: 'Pago no completado', texto: 'El formulario de Webpay expiro.' });
      return;
    }
    (async () => {
      try {
        const token = await getToken();
        const pago = anulado
          ? await api.pagos.webpayAnular(token, anulado)
          : await api.pagos.webpayConfirmar(token, tokenWs);
        setEstado(pago.estado === 'APROBADO'
          ? { tipo: 'info', titulo: 'Pago aprobado', texto: `Orden N° ${pago.ordenId} pagada con Webpay: ${precio(pago.monto)}.` }
          : { tipo: 'error', titulo: 'Pago rechazado', texto: pago.motivo });
      } catch (error) {
        setEstado({ tipo: 'error', titulo: 'No se pudo confirmar el pago', texto: error.detalle || error.message });
      }
    })();
  }, [anulado, tokenWs, getToken]);

  return (
    <>
      <h1>Resultado del pago</h1>
      <Estado tipo={estado.tipo} titulo={estado.titulo} texto={estado.texto} />
      <p><Link to="/pedidos">Volver a mis pedidos</Link></p>
    </>
  );
}

export default function PagoRetorno() {
  return (
    <section className="seccion">
      <RequireAuth>
        <Retorno />
      </RequireAuth>
    </section>
  );
}
