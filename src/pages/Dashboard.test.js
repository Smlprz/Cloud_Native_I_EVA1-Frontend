import React from 'react';
import { act, render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useAuth } from '../auth/AuthContext';

jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../api/client', () => ({
  __esModule: true,
  default: { analytics: { metricas: jest.fn().mockRejectedValue(new Error('sin REST')) } },
}));

const METRICAS = {
  totalEventos: 128,
  eventosUltimoMinuto: 9,
  eventosPorTipo: { PRODUCTO_VISTO: 100, ITEM_AGREGADO: 20, COMPRA_REALIZADA: 8 },
  productosMasVistos: [{ productoId: 1, nombre: 'Alimento Perro A', vistas: 55 }],
  usuariosActivos: 4,
  pagos: { aprobados: 6, rechazados: 2, bloqueadosPorFraude: 1 },
  alertasFraude: [{ ordenId: 77, tarjetaUltimos4: '0002', motivo: 'tarjeta repetida', momento: '2026-11-16T12:00:00Z' }],
  mensajesDescartados: 0,
  actualizado: '2026-11-16T12:00:05Z',
};

/** WebSocket falso: guarda las instancias para que la prueba pueda simular al servidor. */
class WebSocketFalso {
  static instancias = [];
  constructor(url) {
    this.url = url;
    this.cerrado = false;
    WebSocketFalso.instancias.push(this);
  }
  close() {
    this.cerrado = true;
  }
}

describe('Dashboard en tiempo real', () => {
  beforeEach(() => {
    WebSocketFalso.instancias = [];
    global.WebSocket = WebSocketFalso;
    useAuth.mockReturnValue({
      listo: true, autenticado: true, roles: ['ADMIN'], tieneRol: () => true,
      getToken: async () => 'token-admin', login: jest.fn(),
    });
  });

  test('se conecta con el token en la URL y muestra las metricas que llegan por WebSocket', async () => {
    render(<Dashboard />);
    await screen.findByText(/Metricas en tiempo real/i);
    await act(async () => {});

    const socket = WebSocketFalso.instancias[0];
    expect(socket.url).toMatch(/\/ws\/metricas\?token=token-admin$/);

    await act(async () => {
      socket.onopen();
      socket.onmessage({ data: JSON.stringify(METRICAS) });
    });

    expect(screen.getByText('En vivo')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();            // clics totales
    expect(screen.getByText('Alimento Perro A')).toBeInTheDocument(); // producto mas visto
    expect(screen.getByText('Productos vistos')).toBeInTheDocument(); // tipo de evento traducido
    expect(screen.getByText('Bloqueados por fraude')).toBeInTheDocument();
    expect(screen.getByText('****0002')).toBeInTheDocument();         // alerta de fraude

    // llega una actualizacion: el numero cambia sin recargar la pagina
    await act(async () => {
      socket.onmessage({ data: JSON.stringify({ ...METRICAS, totalEventos: 129 }) });
    });
    expect(screen.getByText('129')).toBeInTheDocument();
  });

  test('un mensaje que no es JSON se ignora sin romper el dashboard', async () => {
    render(<Dashboard />);
    await act(async () => {});
    const socket = WebSocketFalso.instancias[0];

    await act(async () => {
      socket.onopen();
      socket.onmessage({ data: 'basura' });
    });

    expect(screen.getByText('En vivo')).toBeInTheDocument();
    expect(screen.getByText(/esperando datos/i)).toBeInTheDocument();
  });

  test('al salir de la pantalla cierra la conexion', async () => {
    const { unmount } = render(<Dashboard />);
    await act(async () => {});
    const socket = WebSocketFalso.instancias[0];

    unmount();

    expect(socket.cerrado).toBe(true);
  });
});
