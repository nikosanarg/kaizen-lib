// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CAMISETAS_HAXBALL, DiscoHaxball } from './DiscoHaxball';

afterEach(cleanup);

const rectangulos = () => Array.from(document.querySelectorAll('rect'));
const patron = () => document.querySelector('pattern')!;
const svg = () => document.querySelector('svg')!;

describe('DiscoHaxball — catálogo', () => {
  it('tiene las 81 camisetas de global_shirts (kaizen-bot/structure/base.js)', () => {
    expect(Object.keys(CAMISETAS_HAXBALL)).toHaveLength(81);
  });

  it('cada entrada trae nombre, ángulo, colorTexto y al menos un color', () => {
    for (const camiseta of Object.values(CAMISETAS_HAXBALL)) {
      expect(camiseta.nombre.length).toBeGreaterThan(0);
      expect(typeof camiseta.angulo).toBe('number');
      expect(camiseta.colorTexto).toMatch(/^#[0-9a-f]{6}$/);
      expect(camiseta.colores.length).toBeGreaterThanOrEqual(1);
      expect(camiseta.colores.length).toBeLessThanOrEqual(3);
    }
  });
});

describe('DiscoHaxball — por clave del catálogo', () => {
  it('una franja por color, en el orden del catálogo', () => {
    render(<DiscoHaxball camiseta="boca" />);
    const colores = rectangulos().map((r) => r.getAttribute('fill'));
    expect(colores).toEqual(CAMISETAS_HAXBALL.boca.colores);
  });

  it('un solo color no rompe: una franja, mismo color que "colores[0]"', () => {
    render(<DiscoHaxball camiseta="negro" />);
    expect(rectangulos()).toHaveLength(1);
    expect(rectangulos()[0]!.getAttribute('fill')).toBe('#000000');
  });

  it('rota el patrón al ángulo del catálogo', () => {
    render(<DiscoHaxball camiseta="alemania" />);
    expect(patron().getAttribute('patternTransform')).toBe('rotate(270 50 50)');
  });

  it('el nombre accesible nombra a la camiseta', () => {
    render(<DiscoHaxball camiseta="river" />);
    expect(screen.getByRole('img', { name: 'Camiseta de River Plate' })).toBeTruthy();
  });
});

describe('DiscoHaxball — camiseta suelta (fuera del catálogo)', () => {
  const propia = { nombre: 'Personalizada', angulo: 45, colorTexto: '#111111', colores: ['#ff0000', '#00ff00'] };

  it('acepta un objeto CamisetaHaxball en vez de una clave', () => {
    render(<DiscoHaxball camiseta={propia} />);
    expect(screen.getByRole('img', { name: 'Camiseta de Personalizada' })).toBeTruthy();
    expect(rectangulos().map((r) => r.getAttribute('fill'))).toEqual(propia.colores);
  });
});

describe('DiscoHaxball — tamaño y className', () => {
  it('size por defecto es 64', () => {
    render(<DiscoHaxball camiseta="negro" />);
    expect(svg().getAttribute('width')).toBe('64');
    expect(svg().getAttribute('height')).toBe('64');
  });

  it('size se puede pisar', () => {
    render(<DiscoHaxball camiseta="negro" size={96} />);
    expect(svg().getAttribute('width')).toBe('96');
    expect(svg().getAttribute('height')).toBe('96');
  });

  it('className llega al svg', () => {
    render(<DiscoHaxball camiseta="negro" className="mi-clase" />);
    expect(svg().getAttribute('class')).toContain('mi-clase');
  });
});
