import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import RequireAuth from '../auth/RequireAuth';
import { RABBIT_PANEL_URL } from '../config';

// Colas y exchanges del flujo real de ordenes: borrarlos corta los correos de confirmacion.
const PROTEGIDOS = ['orden.creada', 'orden.creada.dlq', 'pedidos.exchange', 'pedidos.dlx'];

function Tarjeta({ titulo, ayuda, children }) {
  return (
    <div className="formulario">
      <h2>{titulo}</h2>
      {ayuda && <p className="texto-suave">{ayuda}</p>}
      {children}
    </div>
  );
}

function RabbitAdminContent() {
  const { getToken } = useAuth();
  const aviso = useToast();
  const [ocupado, setOcupado] = useState(false);
  const [info, setInfo] = useState(null);

  const [cola, setCola] = useState({ name: '', dlx: '', dlk: '' });
  const [exchange, setExchange] = useState({ name: '', type: 'direct' });
  const [binding, setBinding] = useState({ queue: '', exchange: '', routingKey: '' });
  const [consulta, setConsulta] = useState('orden.creada');
  const [borrar, setBorrar] = useState({ tipo: 'queue', name: '' });

  // Ejecuta una operacion contra el administrador con bloqueo de doble clic y aviso del resultado.
  const ejecutar = async (accion, exito) => {
    setOcupado(true);
    try {
      const resultado = await accion(await getToken());
      if (exito) aviso.exito(exito);
      return resultado;
    } catch (err) {
      aviso.error(err.message);
      return undefined;
    } finally {
      setOcupado(false);
    }
  };

  const crearCola = (e) => {
    e.preventDefault();
    ejecutar(
      (t) => api.rabbit.crearCola(t, {
        name: cola.name.trim(),
        durable: true,
        deadLetterExchange: cola.dlx.trim() || null,
        deadLetterRoutingKey: cola.dlk.trim() || null,
      }),
      `Cola "${cola.name.trim()}" creada`
    );
  };

  const crearExchange = (e) => {
    e.preventDefault();
    ejecutar(
      (t) => api.rabbit.crearExchange(t, { name: exchange.name.trim(), type: exchange.type, durable: true }),
      `Exchange "${exchange.name.trim()}" creado`
    );
  };

  const datosBinding = () => ({
    queue: binding.queue.trim(),
    exchange: binding.exchange.trim(),
    routingKey: binding.routingKey.trim(),
  });

  const consultar = async (e) => {
    e.preventDefault();
    setInfo(null);
    const r = await ejecutar((t) => api.rabbit.infoCola(t, consulta.trim()));
    if (r) setInfo(r);
  };

  const eliminar = (e) => {
    e.preventDefault();
    const nombre = borrar.name.trim();
    const aviso1 = PROTEGIDOS.includes(nombre)
      ? `"${nombre}" es parte del flujo de ordenes: si lo borras, dejan de enviarse los correos. Continuar?`
      : `Eliminar ${borrar.tipo === 'queue' ? 'la cola' : 'el exchange'} "${nombre}"?`;
    if (!window.confirm(aviso1)) return;
    ejecutar(
      (t) => (borrar.tipo === 'queue' ? api.rabbit.eliminarCola(t, nombre) : api.rabbit.eliminarExchange(t, nombre)),
      'Eliminado'
    );
  };

  return (
    <>
      <h1>Administrador de RabbitMQ</h1>
      <p className="texto-suave">
        Crea y elimina colas, exchanges y bindings a traves de <strong>ms-rabbit-admin</strong>.
        {RABBIT_PANEL_URL && (
          <> Tambien puedes abrir el <a href={RABBIT_PANEL_URL} target="_blank" rel="noreferrer">panel de RabbitMQ</a>.</>
        )}
      </p>

      <div className="doble">
        <Tarjeta titulo="Consultar cola" ayuda="Muestra mensajes pendientes y consumidores.">
          <form onSubmit={consultar} className="linea">
            <input required value={consulta} onChange={(e) => setConsulta(e.target.value)} aria-label="Nombre de la cola" />
            <button type="submit" className="btn" disabled={ocupado}>Consultar</button>
          </form>
          {info && (
            <p className="resultado">
              <strong>{info.name}</strong>: {info.mensajes} mensajes, {info.consumidores} consumidores
            </p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Crear exchange">
          <form onSubmit={crearExchange} className="formulario-grilla">
            <label>Nombre
              <input required value={exchange.name} onChange={(e) => setExchange({ ...exchange, name: e.target.value })} />
            </label>
            <label>Tipo
              <select value={exchange.type} onChange={(e) => setExchange({ ...exchange, type: e.target.value })}>
                {['direct', 'topic', 'fanout', 'headers'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <button type="submit" className="btn" disabled={ocupado}>Crear exchange</button>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Crear cola" ayuda="Para tener DLQ indica el exchange de mensajes muertos.">
          <form onSubmit={crearCola} className="formulario-grilla">
            <label>Nombre
              <input required value={cola.name} onChange={(e) => setCola({ ...cola, name: e.target.value })} />
            </label>
            <label>Dead-letter exchange
              <input value={cola.dlx} onChange={(e) => setCola({ ...cola, dlx: e.target.value })} placeholder="opcional" />
            </label>
            <label>Dead-letter routing key
              <input value={cola.dlk} onChange={(e) => setCola({ ...cola, dlk: e.target.value })} placeholder="opcional" />
            </label>
            <button type="submit" className="btn" disabled={ocupado}>Crear cola</button>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Binding" ayuda="Une una cola con un exchange mediante una routing key.">
          <div className="formulario-grilla">
            <label>Cola
              <input value={binding.queue} onChange={(e) => setBinding({ ...binding, queue: e.target.value })} />
            </label>
            <label>Exchange
              <input value={binding.exchange} onChange={(e) => setBinding({ ...binding, exchange: e.target.value })} />
            </label>
            <label>Routing key
              <input value={binding.routingKey} onChange={(e) => setBinding({ ...binding, routingKey: e.target.value })} />
            </label>
          </div>
          <div className="acciones">
            <button type="button" className="btn" disabled={ocupado || !binding.queue || !binding.exchange}
              onClick={() => ejecutar((t) => api.rabbit.crearBinding(t, datosBinding()), 'Binding creado')}>
              Crear binding
            </button>
            <button type="button" className="btn btn-oscuro" disabled={ocupado || !binding.queue || !binding.exchange}
              onClick={() => window.confirm('Eliminar este binding?') &&
                ejecutar((t) => api.rabbit.eliminarBinding(t, datosBinding()), 'Binding eliminado')}>
              Eliminar binding
            </button>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Eliminar cola o exchange" ayuda="Las colas del flujo de ordenes piden confirmacion adicional.">
          <form onSubmit={eliminar} className="linea">
            <select value={borrar.tipo} onChange={(e) => setBorrar({ ...borrar, tipo: e.target.value })} aria-label="Tipo">
              <option value="queue">Cola</option>
              <option value="exchange">Exchange</option>
            </select>
            <input required value={borrar.name} onChange={(e) => setBorrar({ ...borrar, name: e.target.value })} aria-label="Nombre" />
            <button type="submit" className="btn btn-peligro" disabled={ocupado}>Eliminar</button>
          </form>
        </Tarjeta>
      </div>
    </>
  );
}

export default function RabbitAdmin() {
  return (
    <section className="seccion">
      <RequireAuth roles={['ADMIN']}>
        <RabbitAdminContent />
      </RequireAuth>
    </section>
  );
}
