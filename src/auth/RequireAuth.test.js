import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RequireAuth from './RequireAuth';
import { useAuth } from './AuthContext';

jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }));

const sesion = (cambios) => ({
  listo: true,
  autenticado: true,
  roles: ['CLIENTE'],
  tieneRol: (...r) => r.includes('CLIENTE'),
  login: jest.fn(),
  ...cambios,
});

describe('RequireAuth', () => {
  test('mientras carga la sesion no muestra el contenido', () => {
    useAuth.mockReturnValue(sesion({ listo: false }));
    render(<RequireAuth><p>secreto</p></RequireAuth>);
    expect(screen.queryByText('secreto')).not.toBeInTheDocument();
    expect(screen.getByText(/verificando sesion/i)).toBeInTheDocument();
  });

  test('sin sesion ofrece iniciar sesion', () => {
    const login = jest.fn();
    useAuth.mockReturnValue(sesion({ autenticado: false, login }));
    render(<RequireAuth><p>secreto</p></RequireAuth>);
    expect(screen.queryByText('secreto')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));
    expect(login).toHaveBeenCalled();
  });

  test('con sesion y sin exigir rol muestra el contenido', () => {
    useAuth.mockReturnValue(sesion());
    render(<RequireAuth><p>secreto</p></RequireAuth>);
    expect(screen.getByText('secreto')).toBeInTheDocument();
  });

  test('con el rol exigido muestra el contenido', () => {
    useAuth.mockReturnValue(sesion());
    render(<RequireAuth roles={['CLIENTE']}><p>secreto</p></RequireAuth>);
    expect(screen.getByText('secreto')).toBeInTheDocument();
  });

  test('sin el rol exigido muestra "Sin permiso"', () => {
    useAuth.mockReturnValue(sesion());
    render(<RequireAuth roles={['ADMIN']}><p>secreto</p></RequireAuth>);
    expect(screen.queryByText('secreto')).not.toBeInTheDocument();
    expect(screen.getByText(/sin permiso/i)).toBeInTheDocument();
  });

  test('si los roles aun no llegaron muestra "cargando" y no "sin permiso"', () => {
    useAuth.mockReturnValue(sesion({ roles: [], tieneRol: () => false }));
    render(<RequireAuth roles={['ADMIN']}><p>secreto</p></RequireAuth>);
    expect(screen.getByText(/cargando permisos/i)).toBeInTheDocument();
    expect(screen.queryByText(/sin permiso/i)).not.toBeInTheDocument();
  });
});
