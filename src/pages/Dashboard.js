import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import RequireAuth from '../auth/RequireAuth';
import { KAFKA_UI_URL, wsMetricasUrl } from '../config';
import { fecha } from '../utils/formato';

const ESTADOS = {
  conectando: { clase: 'espera', texto: 'Conectando...' },
  vivo: { clase: 'vivo', texto: 'En vivo' },
  reconectando: { clase: 'espera', texto: 'Reconectando...' },
  'sin-sesion': { clase: 'caido', texto: 'Sin sesion' },
};

const TIPOS = {
  PRODUCTO_VISTO: 'Productos vistos',
  ITEM_AGREGADO: 'Agregados al carrito',
  ITEM_ELIMINADO: 'Quitados del carrito',
  COMPRA_REALIZADA: 'Compras',
  CUPON_APLICADO: 'Cupones aplicados',
  ENVIO_GESTIONADO: 'Envios gestionados',
};

/**
 * Se conecta por WebSocket a /ws/metricas y devuelve las metricas mas recientes. El navegador no puede enviar el
 * encabezado Authorization en un WebSocket, asi que el token de Azure va en la URL; el servidor lo valida (firma,
 * vigencia, emisor, audiencia y rol ADMIN) antes de aceptar la conexion. Si se corta, reintenta con espera creciente
 * y pide un token nuevo (el anterior pudo vencer).
 */
function useMetricasEnVivo(getToken) {
  const [metricas, setMetricas] = useState(null);
  const [estado, setEstado] = useState('conectando');

  useEffect(() => {
    let cerrado = false;
    let socket = null;
    let temporizador = null;
    let intentos = 0;

    const programar = () => {
      intentos += 1;
      temporizador = setTimeout(conectar, Math.min(15000, 1000 * 2 ** Math.min(intentos, 4)));
    };

    async function conectar() {
      if (cerrado) return;
      setEstado(intentos === 0 ? 'conectando' : 'reconectando');
      let token;
      try {
        token = await getToken();
      } catch (e) {
        setEstado('sin-sesion');
        return;
      }
      try {
        socket = new WebSocket(`${wsMetricasUrl()}?token=${encodeURIComponent(token)}`);
      } catch (e) {
        programar();
        return;
      }
      socket.onopen = () => {
        intentos = 0;
        setEstado('vivo');
      };
      socket.onmessage = (mensaje) => {
        try {
          setMetricas(JSON.parse(mensaje.data));
        } catch (e) {
          /* mensaje que no es JSON: se ignora */
        }
      };
      socket.onclose = () => {
        if (!cerrado) {
          setEstado('reconectando');
          programar();
        }
      };
      socket.onerror = () => socket.close();
    }

    conectar();
    return () => {
      cerrado = true;
      clearTimeout(temporizador);
      if (socket) socket.close();
    };
  }, [getToken]);

  return { metricas, estado };
}

function Indicador({ titulo, valor, clase = '' }) {
  return (
    <div className={`indicador ${clase}`}>
      <span className="indicador-valor">{valor}</span>
      <span className="indicador-titulo">{titulo}</span>
    </div>
  );
}

/** Lista de barras horizontales: el ancho es proporcional al valor mas alto. */
function Barras({ filas, vacio }) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  if (filas.length === 0) return <p className="texto-suave">{vacio}</p>;
  return (
    <ul className="barras">
      {filas.map((f) => (
        <li key={f.clave}>
          <span className="barras-texto">{f.texto}</span>
          <span className="barras-pista">
            <span className="barras-relleno" style={{ width: `${(f.valor / maximo) * 100}%` }} />
          </span>
          <strong>{f.valor}</strong>
        </li>
      ))}
    </ul>
  );
}

function DashboardContent() {
  const { getToken } = useAuth();
  const { metricas, estado } = useMetricasEnVivo(getToken);
  const [inicial, setInicial] = useState(null);

  // Mientras el WebSocket conecta se muestra la ultima foto por REST (misma informacion).
  useEffect(() => {
    let activo = true;
    getToken()
      .then((t) => api.analytics.metricas(t))
      .then((m) => activo && setInicial(m))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [getToken]);

  const datos = metricas || inicial;
  const e = ESTADOS[estado];

  return (
    <>
      <div className="dashboard-encabezado">
        <h1>Metricas en tiempo real</h1>
        <span className={`estado-ws estado-ws-${e.clase}`} role="status">
          <span className="punto" aria-hidden="true" /> {e.texto}
        </span>
      </div>
      <p className="texto-suave">
        Calculadas a partir de los eventos que llegan por Kafka (topicos <code>eventos.navegacion</code> y{' '}
        <code>eventos.pagos</code>) y enviadas por WebSocket apenas cambian.
        {KAFKA_UI_URL && (
          <> Abre <a href={KAFKA_UI_URL} target="_blank" rel="noreferrer">Kafka-UI</a> para ver los topicos y el lag.</>
        )}
      </p>

      {!datos ? (
        <p className="texto-suave">Esperando datos...</p>
      ) : (
        <>
          <div className="indicadores">
            <Indicador titulo="Clics totales" valor={datos.totalEventos} />
            <Indicador titulo="Clics en el ultimo minuto" valor={datos.eventosUltimoMinuto} />
            <Indicador titulo="Usuarios activos" valor={datos.usuariosActivos} />
            <Indicador titulo="Mensajes descartados" valor={datos.mensajesDescartados} clase={datos.mensajesDescartados ? 'aviso' : ''} />
          </div>

          <h2>Pagos</h2>
          <div className="indicadores">
            <Indicador titulo="Aprobados" valor={datos.pagos.aprobados} clase="ok" />
            <Indicador titulo="Rechazados" valor={datos.pagos.rechazados} clase="aviso" />
            <Indicador titulo="Bloqueados por fraude" valor={datos.pagos.bloqueadosPorFraude} clase={datos.pagos.bloqueadosPorFraude ? 'peligro' : ''} />
          </div>

          <div className="doble">
            <div className="formulario">
              <h2>Productos mas vistos</h2>
              <Barras
                vacio="Aun no hay visitas a productos."
                filas={datos.productosMasVistos.map((p) => ({ clave: p.productoId, texto: p.nombre, valor: p.vistas }))}
              />
            </div>
            <div className="formulario">
              <h2>Clics por tipo de evento</h2>
              <Barras
                vacio="Aun no hay eventos."
                filas={Object.entries(datos.eventosPorTipo).map(([tipo, n]) => ({ clave: tipo, texto: TIPOS[tipo] || tipo, valor: n }))}
              />
            </div>
          </div>

          <div className="formulario">
            <h2>Alertas de fraude</h2>
            {datos.alertasFraude.length === 0 ? (
              <p className="texto-suave">Sin alertas: ninguna tarjeta ha sido bloqueada.</p>
            ) : (
              <table className="tabla">
                <thead>
                  <tr><th>Cuando</th><th>Orden</th><th>Tarjeta</th><th>Motivo</th></tr>
                </thead>
                <tbody>
                  {datos.alertasFraude.map((a, i) => (
                    <tr key={`${a.ordenId}-${a.momento}-${i}`}>
                      <td>{fecha(a.momento)}</td>
                      <td>{a.ordenId}</td>
                      <td>****{a.tarjetaUltimos4}</td>
                      <td>{a.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function Dashboard() {
  return (
    <section className="seccion">
      <RequireAuth roles={['ADMIN']}>
        <DashboardContent />
      </RequireAuth>
    </section>
  );
}
