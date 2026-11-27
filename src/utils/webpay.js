// Webpay exige llegar a su formulario con un POST que lleva el campo token_ws.
export function irAWebpay({ url, token }) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  const campo = document.createElement('input');
  campo.type = 'hidden';
  campo.name = 'token_ws';
  campo.value = token;
  form.appendChild(campo);
  document.body.appendChild(form);
  form.submit();
}
