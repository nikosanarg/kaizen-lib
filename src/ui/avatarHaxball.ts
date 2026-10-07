/** Lugares del avatar de Haxball sobre el disco: dos caracteres, o un emoji que ocupa los dos. */
export const LUGARES_AVATAR_HAXBALL = 2;

const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

/**
 * Recorta un texto a lo que entra en el avatar: cuenta por grafemas (una
 * bandera o una familia es uno solo), un emoji ocupa los 2 lugares y lo que
 * no entra entero se descarta, en orden. Es la regla que valida quien guarda
 * el avatar y la que aplica `DiscoHaxball` al dibujarlo.
 */
export function recortarAvatarHaxball(texto: string): string {
  const grafemas = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(texto.trim());
  let resultado = '';
  let ocupados = 0;
  for (const { segment } of grafemas) {
    const lugares = EMOJI.test(segment) ? LUGARES_AVATAR_HAXBALL : 1;
    if (ocupados + lugares > LUGARES_AVATAR_HAXBALL) break;
    resultado += segment;
    ocupados += lugares;
  }
  return resultado;
}
