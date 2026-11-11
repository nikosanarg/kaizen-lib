import { describe, expect, it } from 'vitest';
import { valueOf } from '../tokens/testing/css';
import { RESPALDO, parsearCurva, parsearDuracion } from './tiempos';
import { fade, scale, slideSide, slideUp } from './presets';

describe('tiempos de movimiento', () => {
  it('el respaldo sin DOM es igual a defaults.css', () => {
    expect(parsearDuracion(valueOf('--kz-duration-enter', 'dark'))).toBe(RESPALDO.enter);
    expect(parsearDuracion(valueOf('--kz-duration-exit', 'dark'))).toBe(RESPALDO.exit);
    expect(parsearCurva(valueOf('--kz-ease-enter', 'dark'))).toEqual(RESPALDO.easeEnter);
    expect(parsearCurva(valueOf('--kz-ease-exit', 'dark'))).toEqual(RESPALDO.easeExit);
  });

  it('parsea ms, s y descarta lo que no entiende', () => {
    expect(parsearDuracion('200ms')).toBe(0.2);
    expect(parsearDuracion(' 0.3s ')).toBe(0.3);
    expect(parsearDuracion('')).toBeNull();
    expect(parsearCurva('ease')).toBeNull();
  });
});

describe('presets', () => {
  it('la salida vuelve al estado inicial con la transición de salida', () => {
    for (const p of [fade(), scale(), slideUp(), slideSide(), slideSide('left')]) {
      const { transition, ...destinoSalida } = p.exit;
      expect(destinoSalida).toEqual(p.initial);
      expect(transition).toEqual({ duration: RESPALDO.exit, ease: RESPALDO.easeExit });
      expect(p.animate.transition).toEqual({ duration: RESPALDO.enter, ease: RESPALDO.easeEnter });
    }
  });

  it('slideSide entra desde el lado pedido', () => {
    expect(slideSide('left').initial.x).toBe(-16);
    expect(slideSide().initial.x).toBe(16);
  });

  it('acepta pisar tiempos puntuales', () => {
    expect(fade({ tiempos: { enter: 1 } }).animate.transition).toMatchObject({ duration: 1 });
  });
});
