import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Recomendaciones from './Recomendaciones';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../api/client', () => ({ __esModule: true, default: { analytics: { recomendaciones: jest.fn() } } }));

const sesion = (autenticado) => ({ autenticado, getToken: async () => 'tok' });
const ver = () => render(<MemoryRouter><Recomendaciones productoId={1} /></MemoryRouter>);

describe('Recomendaciones', () => {
  beforeEach(() => jest.clearAllMocks());

  test('sin sesion no muestra nada ni consulta el servicio', () => {
    useAuth.mockReturnValue(sesion(false));
    const { container } = ver();
    expect(container).toBeEmptyDOMElement();
    expect(api.analytics.recomendaciones).not.toHaveBeenCalled();
  });

  test('con sesion muestra los productos sugeridos con su motivo', async () => {
    useAuth.mockReturnValue(sesion(true));
    api.analytics.recomendaciones.mockResolvedValue([
      { productoId: 2, nombre: 'Alimento Perro B', precio: 10990, categoria: 'Alimento Perros', imagenUrl: 'x.webp', motivo: 'Parecido a Alimento Perro A' },
    ]);
    ver();

    expect(await screen.findByText('Recomendados para ti')).toBeInTheDocument();
    // la imagen y el titulo enlazan al mismo producto
    const enlaces = screen.getAllByRole('link', { name: 'Alimento Perro B' });
    expect(enlaces.length).toBeGreaterThan(0);
    enlaces.forEach((enlace) => expect(enlace).toHaveAttribute('href', '/productos/2'));
    expect(screen.getByText('Parecido a Alimento Perro A')).toBeInTheDocument();
    expect(api.analytics.recomendaciones).toHaveBeenCalledWith('tok', { productoId: 1 });
  });

  test('si falla el servicio la seccion no aparece y no rompe la pagina', async () => {
    useAuth.mockReturnValue(sesion(true));
    api.analytics.recomendaciones.mockRejectedValue(new Error('servicio caido'));
    const { container } = ver();

    await new Promise((resolver) => setTimeout(resolver, 50));

    expect(screen.queryByText('Recomendados para ti')).not.toBeInTheDocument();
    expect(container.querySelector('.recomendados')).toBeNull();
  });
});
