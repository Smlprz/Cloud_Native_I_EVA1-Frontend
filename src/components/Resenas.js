import React, { useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import Estado from './Estado';
import { fecha, promedio } from '../utils/formato';

const Estrellas = ({ valor }) => (
  <span className="estrellas" aria-label={`${valor} de 5`}>
    {'★'.repeat(Math.round(valor))}
    <span className="estrellas-vacias">{'★'.repeat(5 - Math.round(valor))}</span>
  </span>
);

/** Resenas de un producto (ms-resenas): ver, publicar y borrar la propia. */
export default function Resenas({ productoId, autenticado }) {
  const { getToken, nombre, login } = useAuth();
  const aviso = useToast();
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { datos, cargando, error, recargar } = useCargar(
    async () => api.resenas.listar(await getToken(), productoId),
    [productoId, autenticado],
    autenticado
  );

  if (!autenticado) {
    return (
      <div className="resenas">
        <h2>Resenas</h2>
        <Estado tipo="info" texto="Inicia sesion para ver y escribir resenas."
          accion={{ texto: 'Iniciar sesion', onClick: login }} />
      </div>
    );
  }

  const lista = datos || [];

  const publicar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.resenas.crear(await getToken(), {
        productoId,
        puntaje,
        comentario: comentario.trim() || null,
      });
      aviso.exito('Resena publicada');
      setComentario('');
      setPuntaje(5);
      recargar();
    } catch (err) {
      aviso.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (resena) => {
    try {
      await api.resenas.eliminar(await getToken(), resena.id);
      aviso.exito('Resena eliminada');
      recargar();
    } catch (err) {
      aviso.error(err.message);
    }
  };

  return (
    <div className="resenas">
      <h2>
        Resenas
        {lista.length > 0 && (
          <small>
            <Estrellas valor={promedio(lista.map((r) => r.puntaje))} /> {promedio(lista.map((r) => r.puntaje)).toFixed(1)} ({lista.length})
          </small>
        )}
      </h2>

      <form className="resena-form" onSubmit={publicar}>
        <label>
          Puntaje
          <select value={puntaje} onChange={(e) => setPuntaje(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
            ))}
          </select>
        </label>
        <label className="campo-ancho">
          Comentario (opcional)
          <textarea
            rows="2"
            maxLength="1000"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuentanos tu experiencia"
          />
        </label>
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Publicando...' : 'Publicar'}
        </button>
      </form>

      {cargando && <Estado tipo="cargando" texto="Cargando resenas..." />}
      {error && (
        <Estado tipo="error" titulo="No se pudieron cargar las resenas" texto={error}
          accion={{ texto: 'Reintentar', onClick: recargar }} />
      )}
      {!cargando && !error && lista.length === 0 && (
        <p className="texto-suave">Aun no hay resenas. Se la primera persona en opinar.</p>
      )}

      <ul className="resena-lista">
        {lista.map((r) => (
          <li key={r.id}>
            <div className="resena-cabecera">
              <strong>{r.usuarioNombre || 'Cliente'}</strong>
              <Estrellas valor={r.puntaje} />
              <span className="texto-suave">{fecha(r.creadoEn)}</span>
              {r.usuarioNombre === nombre && (
                <button type="button" className="btn-texto" onClick={() => borrar(r)}>Eliminar</button>
              )}
            </div>
            {r.comentario && <p>{r.comentario}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
