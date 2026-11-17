import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CuponCarrito from './CuponCarrito';
import api, { ApiError } from '../api/client';

jest.mock('../auth/AuthContext', () => ({ useAuth: () => ({ getToken: async () => 'tok' }) }));
jest.mock('../api/client', () => {
  const real = jest.requireActual('../api/client');
  return { __esModule: true, ...real, default: { cupones: { validar: jest.fn() } } };
});

const escribirYAplicar = (texto) => {
  fireEvent.change(screen.getByPlaceholderText('Ej: VERANO10'), { target: { value: texto } });
  fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));
};

describe('CuponCarrito', () => {
  beforeEach(() => jest.clearAllMocks());

  test('consulta el descuento sobre el total del carrito y lo informa al carrito', async () => {
    api.cupones.validar.mockResolvedValue({ codigo: 'VERANO10', descuento: 6598, total: 59382 });
    const onCambio = jest.fn();
    render(<CuponCarrito total={65980} aplicado={null} onCambio={onCambio} />);

    escribirYAplicar(' verano10 ');

    await waitFor(() => expect(onCambio).toHaveBeenCalledWith({
      codigo: 'VERANO10', descuento: 6598, total: 59382, montoBase: 65980,
    }));
    expect(api.cupones.validar).toHaveBeenCalledWith('tok', { codigo: 'verano10', monto: 65980 });
  });

  test('un cupon que no sirve muestra el motivo que dio el servicio', async () => {
    api.cupones.validar.mockRejectedValue(new ApiError(409, 'La operacion entra en conflicto', 'Ya usaste este cupon'));
    const onCambio = jest.fn();
    render(<CuponCarrito total={65980} aplicado={null} onCambio={onCambio} />);

    escribirYAplicar('USADO');

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya usaste este cupon');
    expect(onCambio).not.toHaveBeenCalled();
  });

  test('con un cupon aplicado muestra el descuento y permite quitarlo', () => {
    const onCambio = jest.fn();
    render(<CuponCarrito total={65980} aplicado={{ codigo: 'VERANO10', descuento: 6598, total: 59382, montoBase: 65980 }} onCambio={onCambio} />);

    expect(screen.getByRole('status')).toHaveTextContent('VERANO10');
    expect(screen.getByRole('status')).toHaveTextContent('$6.598');
    fireEvent.click(screen.getByRole('button', { name: /quitar/i }));
    expect(onCambio).toHaveBeenCalledWith(null);
  });

  test('si cambia el total del carrito el descuento deja de valer y pide aplicarlo de nuevo', async () => {
    const onCambio = jest.fn();
    render(<CuponCarrito total={99000} aplicado={{ codigo: 'VERANO10', descuento: 6598, total: 59382, montoBase: 65980 }} onCambio={onCambio} />);

    await waitFor(() => expect(onCambio).toHaveBeenCalledWith(null));
    expect(screen.getByRole('alert')).toHaveTextContent(/vuelve a aplicar/i);
  });

  test('no consulta nada si el campo esta vacio', () => {
    render(<CuponCarrito total={1000} aplicado={null} onCambio={jest.fn()} />);
    expect(screen.getByRole('button', { name: /aplicar/i })).toBeDisabled();
  });
});
