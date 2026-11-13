// Módulo puro (sin React ni DOM): lo consume también un servidor Node en CommonJS (`dist/camisetas`).
export { CAMISETAS_HAXBALL } from './catalogo';
export type { CamisetaHaxball, NombreCamiseta } from './catalogo';
export { distanciaColores, distanciaCamisetas, rivalQueContrasta, esCamiseta, UMBRAL_CONTRASTE } from './distancia';
