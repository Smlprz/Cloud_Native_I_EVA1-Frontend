import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Cupones, { cuerpoDe } from './Cupones';
import api from '../api/client';

jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    listo: true, autenticado: true, roles: ['ADMIN'], tieneRol: () => true,
    getToken: async () => 'tok', login: jest.fn(),
  }),
}));
const mockExito = jest.fn();
const mockError = jest.fn();
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ exito: mockExito, error: mockError, info: jest.fn() }),
}));
jest.mock('../api/client', () => ({
  __esModule: true,
  default: { cupones: { listar: jest.fn(), crear: jest.fn(), activar: jest.fn() } },
}));

const CUPON = { id: 1, codigo: 'VERANO10', tipo: 'PORCENTAJE', valor: 10, montoMinimo: 50000, venceEn: null, usosMaximos: 5, usosActuales: 2, activo: true };

describe('cuerpoDe', () => {
  test('omite los campos opcionales vacios y convierte los numeros', () => {
    expect(cuerpoDe({ codigo: ' ABC ', tipo: 'MONTO_FIJO', valor: '1500', montoMinimo: '', venceEn: '', usosMaximos: '' }))
      .toEqual({ codigo: 'ABC', tipo: 'MONTO_FIJO', valor: 1500 });
    expect(cuerpoDe({ codigo: 'X-1', tipo: 'PORCENTAJE', valor: '10', montoMinimo: '50000', venceEn: '2026-12-31T23:59', usosMaximos: '3' }))
      .toEqual({ codigo: 'X-1', tipo: 'PORCENTAJE', valor: 10, montoMinimo: 50000, venceEn: '2026-12-31T23:59:00', usosMaximos: 3 });
  });
});

describe('Pantalla de cupones (ADMIN)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.cupones.listar.mockResolvedValue([CUPON]);
  });

  test('lista los cupones con su descuento, usos y estado', async () => {
    render(<Cupones />);

    expect(await screen.findByText('VERANO10')).toBeInTheDocument();
    expect(screen.getByText('10 %')).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  test('crea un cupon con los datos del formulario y recarga la lista', async () => {
    api.cupones.crear.mockResolvedValue({ ...CUPON, codigo: 'NUEVO5' });
    render(<Cupones />);
    await screen.findByText('VERANO10');

    fireEvent.change(screen.getByLabelText(/^Codigo/), { target: { value: 'NUEVO5' } });
    fireEvent.change(screen.getByLabelText(/Porcentaje \(1 a 100\)/), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /crear cupon/i }));

    await waitFor(() => expect(api.cupones.crear).toHaveBeenCalledWith('tok', { codigo: 'NUEVO5', tipo: 'PORCENTAJE', valor: 5 }));
    expect(mockExito).toHaveBeenCalledWith('Cupon NUEVO5 creado');
    await waitFor(() => expect(api.cupones.listar).toHaveBeenCalledTimes(2));
  });

  test('desactiva un cupon', async () => {
    api.cupones.activar.mockResolvedValue({ ...CUPON, activo: false });
    render(<Cupones />);
    await screen.findByText('VERANO10');

    fireEvent.click(screen.getByRole('button', { name: /desactivar/i }));

    await waitFor(() => expect(api.cupones.activar).toHaveBeenCalledWith('tok', 1, false));
  });

  test('si el servicio rechaza el cupon muestra el motivo', async () => {
    const error = Object.assign(new Error('Conflicto'), { detalle: 'Ya existe un cupon con el codigo VERANO10' });
    api.cupones.crear.mockRejectedValue(error);
    render(<Cupones />);
    await screen.findByText('VERANO10');

    fireEvent.change(screen.getByLabelText(/^Codigo/), { target: { value: 'VERANO10' } });
    fireEvent.change(screen.getByLabelText(/Porcentaje \(1 a 100\)/), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /crear cupon/i }));

    await waitFor(() => expect(mockError).toHaveBeenCalledWith('Ya existe un cupon con el codigo VERANO10'));
  });
});
