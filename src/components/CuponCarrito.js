import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { precio } from '../utils/formato';

/**
 * Campo de cupon del carrito (ms-cupones). "Aplicar" solo CONSULTA el descuento (no consume el cupon): el cupon se
 * consume recien al confirmar la compra. Si cambia el total del carrito, el descuento mostrado deja de valer y se pide
 * volver a aplicarlo (el descuento depende del monto).
 *
 * aplicado = { codigo, descuento, total, montoBase }  (montoBase = total del carrito sobre el que se calculo)
 */
export default function CuponCarrito({ total, aplicado, onCambio }) {
  const { getToken } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [error, setError] = useState('');

  const vigente = aplicado && aplicado.montoBase === Number(total);

  useEffect(() => {
    if (aplicado && !vigente) {
      onCambio(null);
      setError('El total del carrito cambio: vuelve a aplicar el cupon.');
    }
  }, [aplicado, vigente, onCambio]);

  const aplicar = async (e) => {
    e.preventDefault();
    if (consultando || !codigo.trim()) return;
    setConsultando(true);
    setError('');
    try {
      const token = await getToken();
      const r = await api.cupones.validar(token, { codigo: codigo.trim(), monto: Number(total) });
      onCambio({ codigo: r.codigo, descuento: r.descuento, total: r.total, montoBase: Number(total) });
      setCodigo('');
    } catch (err) {
      setError(err.detalle || err.message);
    } finally {
      setConsultando(false);
    }
  };

  if (vigente) {
    return (
      <div className="cupon cupon-aplicado" role="status">
        <span>
          Cupon <strong>{aplicado.codigo}</strong> aplicado: <strong>-{precio(aplicado.descuento)}</strong>
        </span>
        <button type="button" className="btn-texto" onClick={() => onCambio(null)}>Quitar</button>
      </div>
    );
  }

  return (
    <form className="cupon" onSubmit={aplicar}>
      <label>
        Cupon de descuento
        <span className="linea">
          <input
            placeholder="Ej: VERANO10"
            maxLength={40}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-oscuro" disabled={consultando || !codigo.trim()}>
            {consultando ? 'Consultando...' : 'Aplicar'}
          </button>
        </span>
      </label>
      {error && <span className="texto-error" role="alert">{error}</span>}
    </form>
  );
}
