// Traduce el nombre de archivo guardado en la BD (columna imagen_url) al asset
// empaquetado por Webpack. Asi el backend solo guarda "RascadorGato137cm.webp"
// y el frontend resuelve la imagen real.

import cachupin from '../Img_productos/AlimentoPerroAdultoCachupin25kg.webp';
import champion from '../Img_productos/AlimentoPerroAdultoChampion.webp';
import championDog3kg from '../Img_productos/AlimentoPerroAdultoChampionDog3kg.webp';
import bolso from '../Img_productos/BolsoMascotaGatoMultifuncional.webp';
import casaL from '../Img_productos/CasaPerroTallaL.webp';
import contenedor from '../Img_productos/ContenedorComidaMascota20kf.webp';
import rascador from '../Img_productos/RascadorGato137cm.webp';
import salsa from '../Img_productos/SalsaPerro300gr.webp';

const MAPA = {
  'AlimentoPerroAdultoCachupin25kg.webp': cachupin,
  'AlimentoPerroAdultoChampion.webp': champion,
  'AlimentoPerroAdultoChampionDog3kg.webp': championDog3kg,
  'BolsoMascotaGatoMultifuncional.webp': bolso,
  'CasaPerroTallaL.webp': casaL,
  'ContenedorComidaMascota20kf.webp': contenedor,
  'RascadorGato137cm.webp': rascador,
  'SalsaPerro300gr.webp': salsa,
};

export const PLACEHOLDER =
  'https://via.placeholder.com/300x300/ff6b6b/ffffff?text=Producto';

export const resolverImagen = (referencia) => {
  if (!referencia) return PLACEHOLDER;
  if (referencia.startsWith('http')) return referencia;
  return MAPA[referencia] || PLACEHOLDER;
};
