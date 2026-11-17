import React, { useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import RequireAuth from '../auth/RequireAuth';
import Estado from '../components/Estado';
import { fecha, precio } from '../utils/formato';

const NUEVO = { codigo: '', tipo: 'PORCENTAJE', valor: '', montoMinimo: '', venceEn: '', usosMaximos: '' };

const valorTexto = (c) => (c.tipo === 'PORCENTAJE' ? `${Number(c.valor)} %` : precio(c.valor));

/** Convierte los campos del formulario al cuerpo que espera ms-cupones (los vacios se omiten). */
export function cuerpoDe(f) {
  const cuerpo = { codigo: f.codigo.trim(), tipo: f.tipo, valor: Number(f.valor) };
  if (f.montoMinimo !== '') cuerpo.montoMinimo = Number(f.montoMinimo);
  if (f.venceEn) cuerpo.venceEn = `${f.venceEn}:00`; // datetime-local -> LocalDateTime del backend
  if (f.usosMaximos !== '') cuerpo.usosMaximos = Number(f.usosMaximos);
  return cuerpo;
}

function CuponesContent() {
  const { getToken } = useAuth();
  const aviso = useToast();
  const [form, setForm] = useState(NUEVO);
  const [ocupado, setOcupado] = useState(false);
  const { datos, cargando, error, recargar } = useCargar(async () => api.cupones.listar(await getToken()), []);
  const lista = datos || [];

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    try {
      const creado = await api.cupones.crear(await getToken(), cuerpoDe(form));
      aviso.exito(`Cupon ${creado.codigo} creado`);
      setForm(NUEVO);
      recargar();
    } catch (err) {
      aviso.error(err.detalle || err.message);
    } finally {
      setOcupado(false);
    }
  };

  const alternar = async (c) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      await api.cupones.activar(await getToken(), c.id, !c.activo);
      recargar();
    } catch (err) {
      aviso.error(err.detalle || err.message);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <h1>Cupones de descuento</h1>
      <p className="texto-suave">
        Los clientes los usan en el carrito antes de confirmar la compra (<strong>ms-cupones</strong>). Cada cliente puede usar
        un cupon una sola vez; al usarse se publica un evento <code>CUPON_APLICADO</code> en Kafka y aparece en el dashboard.
      </p>

      <form className="formulario" onSubmit={crear}>
        <h2>Nuevo cupon</h2>
        <div className="formulario-grilla">
          <label>
            Codigo
            <input required minLength={3} maxLength={40} placeholder="VERANO10" value={form.codigo} onChange={cambiar('codigo')} />
          </label>
          <label>
            Tipo
            <select value={form.tipo} onChange={cambiar('tipo')}>
              <option value="PORCENTAJE">Porcentaje (%)</option>
              <option value="MONTO_FIJO">Monto fijo ($)</option>
            </select>
          </label>
          <label>
            {form.tipo === 'PORCENTAJE' ? 'Porcentaje (1 a 100)' : 'Monto a descontar ($)'}
            <input required type="number" min="0.01" max={form.tipo === 'PORCENTAJE' ? 100 : undefined} step="0.01"
              value={form.valor} onChange={cambiar('valor')} />
          </label>
          <label>
            Compra minima ($, opcional)
            <input type="number" min="0" step="1" value={form.montoMinimo} onChange={cambiar('montoMinimo')} />
          </label>
          <label>
            Vence (opcional)
            <input type="datetime-local" value={form.venceEn} onChange={cambiar('venceEn')} />
          </label>
          <label>
            Usos maximos (opcional)
            <input type="number" min="1" step="1" value={form.usosMaximos} onChange={cambiar('usosMaximos')} />
          </label>
        </div>
        <div className="linea">
          <button type="submit" className="btn" disabled={ocupado}>Crear cupon</button>
        </div>
      </form>

      {cargando && <Estado tipo="cargando" texto="Cargando cupones..." />}
      {error && (
        <Estado tipo="error" titulo="No se pudieron cargar los cupones" texto={error}
          accion={{ texto: 'Reintentar', onClick: recargar }} />
      )}
      {!cargando && !error && lista.length === 0 && (
        <Estado tipo="info" titulo="Aun no hay cupones" texto="Crea el primero con el formulario de arriba." />
      )}
      {!cargando && !error && lista.length > 0 && (
        <table className="tabla">
          <thead>
            <tr><th>Codigo</th><th>Descuento</th><th>Compra minima</th><th>Vence</th><th>Usos</th><th>Estado</th><th /></tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.codigo}</strong></td>
                <td>{valorTexto(c)}</td>
                <td>{Number(c.montoMinimo) > 0 ? precio(c.montoMinimo) : '-'}</td>
                <td>{c.venceEn ? fecha(c.venceEn) : 'Sin vencimiento'}</td>
                <td>{c.usosActuales}{c.usosMaximos ? ` / ${c.usosMaximos}` : ''}</td>
                <td><span className={`etiqueta ${c.activo ? 'etiqueta-ok' : ''}`}>{c.activo ? 'Activo' : 'Desactivado'}</span></td>
                <td>
                  <button type="button" className="btn-texto" disabled={ocupado} onClick={() => alternar(c)}>
                    {c.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default function Cupones() {
  return (
    <section className="seccion">
      <RequireAuth roles={['ADMIN']}>
        <CuponesContent />
      </RequireAuth>
    </section>
  );
}
