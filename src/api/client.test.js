import api, { ApiError, onApiEvento } from './client';

const respuesta = (status, cuerpo) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => 'application/json' },
  json: async () => cuerpo,
});

describe('cliente de API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('GET con token envia Authorization y no envia Content-Type', async () => {
    global.fetch.mockResolvedValue(respuesta(200, []));
    await api.carrito.ver('abc123');

    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/carrito$/);
    expect(opciones.method).toBe('GET');
    expect(opciones.headers.Authorization).toBe('Bearer abc123');
    expect(opciones.headers['Content-Type']).toBeUndefined();
  });

  test('POST envia el cuerpo como JSON', async () => {
    global.fetch.mockResolvedValue(respuesta(201, { id: 1 }));
    await api.carrito.agregar('t', 7, 2);

    const [, opciones] = global.fetch.mock.calls[0];
    expect(opciones.method).toBe('POST');
    expect(opciones.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opciones.body)).toEqual({ productoId: 7, cantidad: 2 });
  });

  test('confirmar la compra envia el correo del comprobante cuando se indica', async () => {
    global.fetch.mockResolvedValue(respuesta(201, { id: 5 }));
    await api.carrito.confirmar('t', 'otro@correo.cl');

    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/carrito\/checkout$/);
    expect(JSON.parse(opciones.body)).toEqual({ email: 'otro@correo.cl' });
  });

  test('confirmar la compra sin correo no envia cuerpo', async () => {
    global.fetch.mockResolvedValue(respuesta(201, { id: 5 }));
    await api.carrito.confirmar('t');
    expect(global.fetch.mock.calls[0][1].body).toBeUndefined();
  });

  test('un 401 se traduce a un mensaje entendible', async () => {
    global.fetch.mockResolvedValue(respuesta(401, {}));
    await expect(api.carrito.ver('vencido')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: expect.stringMatching(/sesion/i),
    });
  });

  test('un 403 indica falta de permisos', async () => {
    global.fetch.mockResolvedValue(respuesta(403, {}));
    await expect(api.rabbit.crearCola('t', { name: 'x' })).rejects.toThrow(/permiso/i);
  });

  test('incluye el detalle que envia el backend', async () => {
    global.fetch.mockResolvedValue(respuesta(400, { detail: 'El nombre es obligatorio' }));
    await expect(api.productos.crear('t', {})).rejects.toThrow(/El nombre es obligatorio/);
  });

  test('si no hay conexion lanza ApiError con status 0', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await api.productos.listar().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });

  test('una respuesta 204 devuelve null', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204, headers: { get: () => '' } });
    await expect(api.carrito.quitar('t', 5)).resolves.toBeNull();
  });

  test('las llamadas que modifican datos emiten un evento; las de lectura no', async () => {
    const eventos = [];
    const baja = onApiEvento((e) => eventos.push(e));

    global.fetch.mockResolvedValue(respuesta(200, []));
    await api.productos.listar();
    expect(eventos).toHaveLength(0);

    global.fetch.mockResolvedValue(respuesta(201, {}));
    await api.resenas.crear('t', { productoId: 1, puntaje: 5 });
    expect(eventos).toEqual([{ method: 'POST', path: '/resenas', status: 201, ok: true }]);

    baja();
  });

  test('arma la consulta con parametros codificados y omite los vacios', async () => {
    global.fetch.mockResolvedValue(respuesta(200, []));
    await api.productos.listar({ nombre: 'collar rojo', categoria: '' });
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/productos\?nombre=collar%20rojo$/);
  });

  test('ver el detalle de un producto con sesion envia el token (para saber quien lo vio); sin sesion no', async () => {
    global.fetch.mockResolvedValue(respuesta(200, { id: 1 }));

    await api.productos.obtener(1, 'tok');
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');

    await api.productos.obtener(1);
    expect(global.fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
  });

  test('pagar envia los datos de la tarjeta a /pagos', async () => {
    global.fetch.mockResolvedValue(respuesta(201, { id: 3, estado: 'APROBADO' }));
    const datos = { ordenId: 7, numeroTarjeta: '4111 1111 1111 1111', titular: 'Ana', vencimiento: '12/30', cvv: '123' };

    await api.pagos.pagar('t', datos);

    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/pagos$/);
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual(datos);
  });

  test('un pago rechazado (402) y uno bloqueado por fraude (429) conservan el motivo del backend', async () => {
    global.fetch.mockResolvedValue(respuesta(402, { detail: 'Fondos insuficientes' }));
    const rechazado = await api.pagos.pagar('t', {}).catch((e) => e);
    expect(rechazado).toBeInstanceOf(ApiError);
    expect(rechazado.status).toBe(402);
    expect(rechazado.detalle).toBe('Fondos insuficientes');

    global.fetch.mockResolvedValue(respuesta(429, { detail: 'bloqueada por seguridad' }));
    const bloqueado = await api.pagos.pagar('t', {}).catch((e) => e);
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.detalle).toBe('bloqueada por seguridad');
  });

  test('las recomendaciones piden el producto que se esta mirando', async () => {
    global.fetch.mockResolvedValue(respuesta(200, []));
    await api.analytics.recomendaciones('t', { productoId: 9 });
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/analytics\/recomendaciones\?productoId=9$/);
  });

  test('confirmar envia el cupon junto con el correo, y solo lo que se indico', async () => {
    global.fetch.mockResolvedValue(respuesta(201, { id: 5 }));

    await api.carrito.confirmar('t', 'a@b.cl', 'VERANO10');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ email: 'a@b.cl', cupon: 'VERANO10' });

    await api.carrito.confirmar('t', 'a@b.cl');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({ email: 'a@b.cl' });

    await api.carrito.confirmar('t');
    expect(global.fetch.mock.calls[2][1].body).toBeUndefined();
  });

  test('validar un cupon envia codigo y monto; un cupon vencido deja el motivo del backend', async () => {
    global.fetch.mockResolvedValue(respuesta(200, { codigo: 'VERANO10', descuento: 100, total: 900 }));
    await api.cupones.validar('t', { codigo: 'VERANO10', monto: 1000 });
    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url.endsWith('/cupones/validar')).toBe(true);
    expect(JSON.parse(opciones.body)).toEqual({ codigo: 'VERANO10', monto: 1000 });

    global.fetch.mockResolvedValue(respuesta(400, { detail: 'El cupon esta vencido' }));
    const error = await api.cupones.validar('t', { codigo: 'OLD', monto: 1000 }).catch((e) => e);
    expect(error.detalle).toBe('El cupon esta vencido');
  });

  test('activar o desactivar un cupon usa PUT /cupones/{id}/activo', async () => {
    global.fetch.mockResolvedValue(respuesta(200, { id: 4, activo: false }));
    await api.cupones.activar('t', 4, false);
    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url.endsWith('/cupones/4/activo')).toBe(true);
    expect(opciones.method).toBe('PUT');
    expect(JSON.parse(opciones.body)).toEqual({ activo: false });
  });
});
