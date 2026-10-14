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
});
