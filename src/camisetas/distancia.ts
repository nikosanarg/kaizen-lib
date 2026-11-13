import { CAMISETAS_HAXBALL, type CamisetaHaxball, type NombreCamiseta } from './catalogo';

/**
 * Portado de `host_colorCylindricalDistance` y `host_shirtDistance` (kaizen-bot, `structure/base.js`):
 * tocar el original implica revisar esta copia. El radio del cilindro es el croma (M - m), no la
 * saturación de HSL, que explota cerca del blanco y del negro.
 */
export const distanciaColores = (hex1: string, hex2: string): number => {
  const hcl = (hex: string): [number, number, number] => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
    const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m;
    const h = d ? 60 * (M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4) : 0;
    return [h, d, (M + m) / 2];
  };
  const [h1, c1, l1] = hcl(hex1);
  const [h2, c2, l2] = hcl(hex2);
  const rad = Math.PI / 180;
  return Math.hypot(c1 * Math.cos(h1 * rad) - c2 * Math.cos(h2 * rad), c1 * Math.sin(h1 * rad) - c2 * Math.sin(h2 * rad), l1 - l2);
};

/**
 * Cuánto se parecen dos camisetas = la distancia de su par de colores de franja MÁS parecido: alcanza un color en
 * común para que en cancha se confundan. `colorTexto` no entra.
 */
export const distanciaCamisetas = (a: CamisetaHaxball, b: CamisetaHaxball): number => {
  let minima = Infinity;
  for (const c1 of new Set(a.colores)) for (const c2 of new Set(b.colores)) minima = Math.min(minima, distanciaColores(c1, c2));
  return minima;
};

/** Debajo de esto dos camisetas chocan (el mismo umbral que usa kaizen-bot, `SHIRT_DIFF_UMBRAL`). */
export const UMBRAL_CONTRASTE = 0.45;

export const esCamiseta = (nombre: unknown): nombre is NombreCamiseta =>
  typeof nombre === 'string' && Object.prototype.hasOwnProperty.call(CAMISETAS_HAXBALL, nombre);

/**
 * Una camiseta rival que contraste con `contra`, determinista: recorre el catálogo desde la posición `semilla`
 * (módulo su largo) y devuelve la primera que supera el umbral; si ninguna lo supera, la más distinta. Nunca
 * devuelve `contra` ni las de `excluir`.
 */
export const rivalQueContrasta = (
  contra: NombreCamiseta,
  { semilla = 0, umbral = UMBRAL_CONTRASTE, excluir = [] }: { semilla?: number; umbral?: number; excluir?: readonly NombreCamiseta[] } = {},
): NombreCamiseta => {
  const nombres = Object.keys(CAMISETAS_HAXBALL) as NombreCamiseta[];
  const base = CAMISETAS_HAXBALL[contra];
  const inicio = ((Math.floor(semilla) % nombres.length) + nombres.length) % nombres.length;
  let mejor: NombreCamiseta = contra, mejorDist = -1;
  for (let i = 0; i < nombres.length; i++) {
    const nombre = nombres[(inicio + i) % nombres.length]!;
    if (nombre === contra || excluir.includes(nombre)) continue;
    const dist = distanciaCamisetas(base, CAMISETAS_HAXBALL[nombre]);
    if (dist > umbral) return nombre;
    if (dist > mejorDist) { mejorDist = dist; mejor = nombre; }
  }
  return mejor;
};
