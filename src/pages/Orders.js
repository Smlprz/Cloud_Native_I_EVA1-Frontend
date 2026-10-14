import React, { useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import RequireAuth from '../auth/RequireAuth';
import Estado from '../components/Estado';
import { fecha, precio } from '../utils/formato';

const PESTANAS = [
  { id: 'pedidos', texto: 'Pedidos (carrito)' },
  { id: 'ordenes', texto: 'Ordenes registradas' },
];

function OrdersContent() {
  const { getToken } = useAuth();
  const [pestana, setPestana] = useState('pedidos');

  // Las dos listas provienen de servicios distintos: ms-carrito y ms-orden.
  const { datos, cargando, error, recargar } = useCargar(
    async () => {
      const token = await getToken();
      return pestana === 'pedidos' ? api.carrito.pedidos(token) : api.ordenes.listar(token);
    },
    [pestana]
  );
  const lista = datos || [];

  return (
    <>
      <h1>Mis pedidos</h1>

      <div className="pestanas" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            className={pestana === p.id ? 'activa' : ''}
            onClick={() => setPestana(p.id)}
          >
            {p.texto}
          </button>
        ))}
        <button type="button" className="btn-texto" onClick={recargar}>Actualizar</button>
      </div>

      {cargando && <Estado tipo="cargando" texto="Cargando..." />}
      {error && (
        <Estado tipo="error" titulo="No se pudo cargar" texto={error}
          accion={{ texto: 'Reintentar', onClick: recargar }} />
      )}
      {!cargando && !error && lista.length === 0 && (
        <Estado tipo="info" titulo="Aun no hay registros" texto="Cuando confirmes una compra aparecera aqui." />
      )}

      {!cargando && !error && lista.length > 0 && (
        <table className="tabla">
          <thead>
            <tr><th>N°</th><th>Fecha</th><th>Estado</th><th>Total</th></tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{fecha(p.creadoEn)}</td>
                <td><span className="etiqueta">{p.estado}</span></td>
                <td>{precio(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default function Orders() {
  return (
    <section className="seccion">
      <RequireAuth>
        <OrdersContent />
      </RequireAuth>
    </section>
  );
}
