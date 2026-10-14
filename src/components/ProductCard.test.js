import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

const producto = { id: 3, nombre: 'Rascador Gato', precio: 24990, stock: 5, categoria: 'Gatos', imagenUrl: '' };

const montar = (props) =>
  render(
    <MemoryRouter>
      <ProductCard producto={producto} onAgregar={jest.fn()} {...props} />
    </MemoryRouter>
  );

describe('ProductCard', () => {
  test('muestra nombre, categoria y precio', () => {
    montar();
    expect(screen.getByText('Rascador Gato')).toBeInTheDocument();
    expect(screen.getByText('Gatos')).toBeInTheDocument();
    expect(screen.getByText(/24\.990/)).toBeInTheDocument();
  });

  test('al pulsar el boton agrega el producto', () => {
    const onAgregar = jest.fn();
    montar({ onAgregar });
    fireEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(onAgregar).toHaveBeenCalledWith(producto);
  });

  test('sin stock el boton queda deshabilitado', () => {
    montar({ producto: { ...producto, stock: 0 } });
    expect(screen.getByRole('button', { name: /sin stock/i })).toBeDisabled();
  });

  test('mientras hay una accion en curso no permite agregar', () => {
    montar({ deshabilitado: true });
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
  });
});
