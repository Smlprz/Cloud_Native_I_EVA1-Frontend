export const precio = (valor) => `$${Number(valor || 0).toLocaleString('es-CL')}`;

export const fecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

export const promedio = (numeros) =>
  numeros.length ? numeros.reduce((s, n) => s + n, 0) / numeros.length : 0;
