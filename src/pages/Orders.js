import React, { useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import RequireAuth from '../auth/RequireAuth';
import Estado from '../components/Estado';
import PagoForm from '../components/PagoForm';
import { fecha, precio } from '../utils/formato';

const PESTANAS = [
  { id: 'pedidos', texto: 'Pedidos (carrito)' },
  { id: 'ordenes', texto: 'Ordenes registradas' },
];

function OrdersContent() {
  const { getToken } = useAuth();
  const [pestana, setPestana] = useState('pedidos');
  const [pagando, setPagando] = useState(null); // id de la orden cuyo formulario de pago esta abierto

  // Las dos listas provienen de servicios distintos: ms-carrito y ms-orden. En "Ordenes registradas" se
  // consultan ademas los pagos (ms-pago) para saber cuales ordenes ya estan pagadas.
  const { datos, cargando, error, recargar } = useCargar(
    async () => {
      const token = await getToken();
      if (pestana === 'pedidos') return { lista: await api.carrito.pedidos(token), pagos: [] };
      const [lista, pagos] = await Promise.all([
        api.ordenes.listar(token),
        api.pagos.listar(token).catch(() => []), // sin ms-pago la lista de ordenes igual se ve
      ]);
      return { lista, pagos };
    },
    [pestana]
  );
  const lista = (datos && datos.lista) || [];
  const pagos = (datos && datos.pagos) || [];
  const estaPagada = (ordenId) => pagos.some((p) => p.ordenId === ordenId && p.estado === 'APROBADO');
  const esOrdenes = pestana === 'ordenes';

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
            onClick={() => {
              setPestana(p.id);
              setPagando(null);
            }}
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
            <tr>
              <th>N°</th><th>Fecha</th><th>Estado</th><th>Total</th>
              {esOrdenes && <th>Pago</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <React.Fragment key={p.id}>
                <tr>
                  <td>{p.id}</td>
                  <td>{fecha(p.creadoEn)}</td>
                  <td><span className="etiqueta">{p.estado}</span></td>
                  <td>{precio(p.total)}</td>
                  {esOrdenes && (
                    <td>
                      {estaPagada(p.id) ? (
                        <span className="etiqueta etiqueta-ok">Pagada</span>
                      ) : (
                        <button type="button" className="btn-texto" onClick={() => setPagando(pagando === p.id ? null : p.id)}>
                          {pagando === p.id ? 'Cancelar' : 'Pagar'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                {esOrdenes && pagando === p.id && (
                  <tr>
                    <td colSpan={5}>
                      <PagoForm
                        orden={p}
                        onPagado={() => {
                          setPagando(null);
                          recargar();
                        }}
                        onCerrar={() => setPagando(null)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
