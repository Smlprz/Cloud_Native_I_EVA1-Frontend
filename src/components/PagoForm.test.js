import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PagoForm from './PagoForm';
import api, { ApiError } from '../api/client';

jest.mock('../auth/AuthContext', () => ({ useAuth: () => ({ getToken: async () => 'token-falso' }) }));
const mockExito = jest.fn();
jest.mock('../context/ToastContext', () => ({ useToast: () => ({ exito: mockExito, error: jest.fn(), info: jest.fn() }) }));
jest.mock('../api/client', () => {
  const real = jest.requireActual('../api/client');
  return { __esModule: true, ...real, default: { pagos: { pagar: jest.fn() } } };
});

const orden = { id: 7, total: 65980 };

function llenar() {
  fireEvent.change(screen.getByLabelText(/numero de tarjeta/i), { target: { value: '4111 1111 1111 1111' } });
  fireEvent.change(screen.getByLabelText(/titular/i), { target: { value: 'Juan Perez' } });
  fireEvent.change(screen.getByLabelText(/vencimiento/i), { target: { value: '12/30' } });
  fireEvent.change(screen.getByLabelText(/cvv/i), { target: { value: '123' } });
}

describe('PagoForm', () => {
  beforeEach(() => jest.clearAllMocks());

  test('muestra el monto de la orden y envia los datos de la tarjeta', async () => {
    api.pagos.pagar.mockResolvedValue({ id: 1, tarjetaUltimos4: '1111' });
    const onPagado = jest.fn();
    render(<PagoForm orden={orden} onPagado={onPagado} onCerrar={jest.fn()} />);
    expect(screen.getByText(/orden N° 7/i)).toHaveTextContent('$65.980');

    llenar();
    fireEvent.click(screen.getByRole('button', { name: /^pagar$/i }));

    await waitFor(() => expect(onPagado).toHaveBeenCalled());
    expect(api.pagos.pagar).toHaveBeenCalledWith('token-falso', {
      ordenId: 7, numeroTarjeta: '4111 1111 1111 1111', titular: 'Juan Perez', vencimiento: '12/30', cvv: '123',
    });
    expect(mockExito).toHaveBeenCalledWith('Pago aprobado');
  });

  test('un pago rechazado muestra el motivo y no cierra el formulario', async () => {
    api.pagos.pagar.mockRejectedValue(new ApiError(402, 'El pago fue rechazado (Fondos insuficientes)', 'Fondos insuficientes'));
    const onPagado = jest.fn();
    render(<PagoForm orden={orden} onPagado={onPagado} onCerrar={jest.fn()} />);

    llenar();
    fireEvent.click(screen.getByRole('button', { name: /^pagar$/i }));

    expect(await screen.findByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText('Fondos insuficientes')).toBeInTheDocument();
    expect(onPagado).not.toHaveBeenCalled();
  });

  test('el antifraude (429) se muestra como transaccion bloqueada', async () => {
    api.pagos.pagar.mockRejectedValue(new ApiError(429, 'Demasiadas solicitudes', 'Mas de 3 intentos de compra en 60 segundos: usuario bloqueado por seguridad hasta las 12:15'));
    render(<PagoForm orden={orden} onPagado={jest.fn()} onCerrar={jest.fn()} />);

    llenar();
    fireEvent.click(screen.getByRole('button', { name: /^pagar$/i }));

    expect(await screen.findByText(/bloqueada por seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueado por seguridad hasta las 12:15/i)).toBeInTheDocument();
  });
});
