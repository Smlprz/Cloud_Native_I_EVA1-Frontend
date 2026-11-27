import React, { useState } from 'react';
import api, { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { precio } from '../utils/formato';
import { irAWebpay } from '../utils/webpay';

const VACIO = { numeroTarjeta: '', titular: '', vencimiento: '', cvv: '' };

/**
 * Formulario de pago de una orden (ms-pago). El monto sale de la orden: aqui solo se piden los datos de la
 * tarjeta. El numero y el CVV viajan al backend y no se guardan: el servidor conserva solo los ultimos 4 digitos.
 *
 * Resultados: aprobado (201), rechazado (402: tarjeta invalida, vencida, sin fondos) y bloqueado por el
 * antifraude (429: la misma tarjeta mas de 3 veces en 10 segundos).
 */
export default function PagoForm({ orden, onPagado, onCerrar }) {
  const { getToken } = useAuth();
  const aviso = useToast();
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  // Webpay: la tarjeta se escribe en el sitio de Transbank; el antifraude cuenta los intentos por usuario.
  const pagarConWebpay = async () => {
    if (enviando) return;
    setEnviando(true);
    setResultado(null);
    try {
      const token = await getToken();
      irAWebpay(await api.pagos.webpayIniciar(token, orden.id));
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setResultado({ tipo: 'fraude', titulo: 'Transaccion bloqueada por seguridad', texto: error.detalle });
      } else {
        setResultado({ tipo: 'rechazado', titulo: 'No se pudo iniciar Webpay', texto: error.detalle || error.message });
      }
    } finally {
      setEnviando(false);
    }
  };

  const pagar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setResultado(null);
    try {
      const token = await getToken();
      const pago = await api.pagos.pagar(token, { ordenId: orden.id, ...datos });
      setResultado({ tipo: 'ok', texto: `Pago aprobado: tarjeta terminada en ${pago.tarjetaUltimos4}.` });
      aviso.exito('Pago aprobado');
      setDatos(VACIO); // no se deja el numero de tarjeta en pantalla
      onPagado();
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setResultado({ tipo: 'fraude', titulo: 'Transaccion bloqueada por seguridad', texto: error.detalle });
      } else if (error instanceof ApiError && error.status === 402) {
        setResultado({ tipo: 'rechazado', titulo: 'Pago rechazado', texto: error.detalle });
      } else {
        setResultado({ tipo: 'rechazado', titulo: 'No se pudo pagar', texto: error.message });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="pago-form" onSubmit={pagar} autoComplete="off">
      <h3>Pagar la orden N° {orden.id} por {precio(orden.total)}</h3>
      <div className="linea">
        <button type="button" className="btn" onClick={pagarConWebpay} disabled={enviando}>
          Pagar con Webpay
        </button>
        <span className="texto-suave">o con tarjeta (pago simulado):</span>
      </div>
      <div className="formulario-grilla">
        <label className="campo-ancho">
          Numero de tarjeta
          <input required inputMode="numeric" placeholder="4111 1111 1111 1111" maxLength={23}
            value={datos.numeroTarjeta} onChange={cambiar('numeroTarjeta')} autoComplete="off" />
        </label>
        <label className="campo-ancho">
          Titular
          <input required maxLength={100} placeholder="Como aparece en la tarjeta"
            value={datos.titular} onChange={cambiar('titular')} autoComplete="off" />
        </label>
        <label>
          Vencimiento (MM/AA)
          <input required placeholder="12/30" pattern="(0[1-9]|1[0-2])/[0-9]{2}" maxLength={5}
            value={datos.vencimiento} onChange={cambiar('vencimiento')} autoComplete="off" />
        </label>
        <label>
          CVV
          <input required type="password" inputMode="numeric" pattern="[0-9]{3,4}" maxLength={4}
            value={datos.cvv} onChange={cambiar('cvv')} autoComplete="off" />
        </label>
      </div>
      <p className="texto-suave">
        Pago simulado. Tarjeta de prueba aprobada: 4111 1111 1111 1111. Una tarjeta terminada en 0002 simula fondos
        insuficientes. Si la misma tarjeta se usa mas de 3 veces en 10 segundos, el antifraude bloquea la transaccion.
      </p>

      {resultado && (
        <div className={`resultado-pago resultado-${resultado.tipo}`} role={resultado.tipo === 'ok' ? 'status' : 'alert'}>
          {resultado.titulo && <strong>{resultado.titulo}</strong>}
          {resultado.texto && <span>{resultado.texto}</span>}
        </div>
      )}

      <div className="linea">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Procesando...' : 'Pagar'}
        </button>
        <button type="button" className="btn btn-oscuro" onClick={onCerrar} disabled={enviando}>
          Cerrar
        </button>
      </div>
    </form>
  );
}
