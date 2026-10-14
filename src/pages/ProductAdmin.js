import React, { useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import RequireAuth from '../auth/RequireAuth';
import Estado from '../components/Estado';
import { precio } from '../utils/formato';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagenUrl: '' };

function ProductAdminContent() {
  const { getToken, tieneRol } = useAuth();
  const aviso = useToast();
  const { datos, cargando, error, recargar } = useCargar(() => api.productos.listar(), []);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null); // id del producto en edicion
  const [enviando, setEnviando] = useState(false);

  const esAdmin = tieneRol('ADMIN'); // el backend solo permite borrar al ADMIN
  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const limpiar = () => {
    setForm(VACIO);
    setEditando(null);
  };

  const editar = (p) => {
    setEditando(p.id);
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: String(p.precio ?? ''),
      stock: String(p.stock ?? ''),
      categoria: p.categoria || '',
      imagenUrl: p.imagenUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardar = async (e) => {
    e.preventDefault();
    const producto = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoria: form.categoria.trim() || null,
      imagenUrl: form.imagenUrl.trim() || null,
    };
    setEnviando(true);
    try {
      const token = await getToken();
      if (editando) {
        await api.productos.actualizar(token, editando, producto);
        aviso.exito('Producto actualizado');
      } else {
        await api.productos.crear(token, producto);
        aviso.exito('Producto creado');
      }
      limpiar();
      recargar();
    } catch (err) {
      aviso.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`Eliminar "${p.nombre}"? Esta accion no se puede deshacer.`)) return;
    try {
      await api.productos.eliminar(await getToken(), p.id);
      aviso.exito('Producto eliminado');
      if (editando === p.id) limpiar();
      recargar();
    } catch (err) {
      aviso.error(err.message);
    }
  };

  return (
    <>
      <h1>Gestion de productos</h1>

      <form className="formulario" onSubmit={guardar}>
        <h2>{editando ? `Editar producto #${editando}` : 'Nuevo producto'}</h2>
        <div className="formulario-grilla">
          <label>Nombre
            <input required maxLength="120" value={form.nombre} onChange={cambiar('nombre')} />
          </label>
          <label>Categoria
            <input maxLength="80" value={form.categoria} onChange={cambiar('categoria')} />
          </label>
          <label>Precio
            <input required type="number" min="0" step="1" value={form.precio} onChange={cambiar('precio')} />
          </label>
          <label>Stock
            <input required type="number" min="0" step="1" value={form.stock} onChange={cambiar('stock')} />
          </label>
          <label className="campo-ancho">Imagen (nombre de archivo o URL)
            <input maxLength="300" value={form.imagenUrl} onChange={cambiar('imagenUrl')} />
          </label>
          <label className="campo-ancho">Descripcion
            <textarea rows="2" maxLength="500" value={form.descripcion} onChange={cambiar('descripcion')} />
          </label>
        </div>
        <div className="acciones">
          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editando && <button type="button" className="btn btn-oscuro" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      {cargando && <Estado tipo="cargando" texto="Cargando productos..." />}
      {error && (
        <Estado tipo="error" titulo="No se pudieron cargar los productos" texto={error}
          accion={{ texto: 'Reintentar', onClick: recargar }} />
      )}
      {!cargando && !error && (
        <table className="tabla">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Categoria</th><th>Precio</th><th>Stock</th><th /></tr>
          </thead>
          <tbody>
            {(datos || []).map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{precio(p.precio)}</td>
                <td>{p.stock}</td>
                <td className="tabla-acciones">
                  <button type="button" className="btn-texto" onClick={() => editar(p)}>Editar</button>
                  {esAdmin && (
                    <button type="button" className="btn-texto peligro" onClick={() => eliminar(p)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default function ProductAdmin() {
  return (
    <section className="seccion">
      <RequireAuth roles={['VENDEDOR', 'ADMIN']}>
        <ProductAdminContent />
      </RequireAuth>
    </section>
  );
}
