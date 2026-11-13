import { describe, expect, it } from 'vitest';
import { CAMISETAS_HAXBALL, distanciaCamisetas, esCamiseta, rivalQueContrasta, UMBRAL_CONTRASTE } from './index';

describe('camisetas', () => {
  it('una camiseta contra sí misma está a distancia 0', () => {
    expect(distanciaCamisetas(CAMISETAS_HAXBALL.boca, CAMISETAS_HAXBALL.boca)).toBe(0);
  });
  it('alcanza un color en común para chocar (River y Croacia, blanco y rojo)', () => {
    expect(distanciaCamisetas(CAMISETAS_HAXBALL.river, CAMISETAS_HAXBALL.croacia)).toBeLessThan(UMBRAL_CONTRASTE);
  });
  it('rojo contra azul contrasta', () => {
    expect(distanciaCamisetas(CAMISETAS_HAXBALL.red, CAMISETAS_HAXBALL.blue)).toBeGreaterThan(UMBRAL_CONTRASTE);
  });
  it('el rival contrasta, es determinista y respeta excluir', () => {
    const a = rivalQueContrasta('boca', { semilla: 7 });
    expect(a).toBe(rivalQueContrasta('boca', { semilla: 7 }));
    expect(a).not.toBe('boca');
    expect(distanciaCamisetas(CAMISETAS_HAXBALL.boca, CAMISETAS_HAXBALL[a])).toBeGreaterThan(UMBRAL_CONTRASTE);
    expect(rivalQueContrasta('boca', { semilla: 7, excluir: [a] })).not.toBe(a);
  });
  it('esCamiseta valida claves del catálogo', () => {
    expect(esCamiseta('boca')).toBe(true);
    expect(esCamiseta('toString')).toBe(false);
    expect(esCamiseta(3)).toBe(false);
  });
});
