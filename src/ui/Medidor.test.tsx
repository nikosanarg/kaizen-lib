// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Medidor, type MedidorSentido } from './Medidor';

afterEach(cleanup);

const relleno = () => document.querySelectorAll('path')[1]!;

const pintar = (valor: number, maximo: number, sentido: MedidorSentido) => {
  render(<Medidor valor={valor} maximo={maximo} sentido={sentido} label="medidor" />);
  return relleno().getAttribute('stroke');
};

const BAJO_ES_VERDE = {
  bajo: 'var(--kz-success)',
  medio: 'var(--kz-info)',
  alto: 'var(--kz-warning)',
  tope: 'var(--kz-danger)',
};

const BAJO_ES_ROJO = {
  bajo: 'var(--kz-danger)',
  medio: 'var(--kz-warning)',
  alto: 'var(--kz-info)',
  tope: 'var(--kz-success)',
};

/**
 * La escala pedida sobre 0 a 10: 10 → tope, 8 a 9,99 → alto, 4 a 7,99 → medio,
 * menos de 4 → bajo. Los cortes son inclusivos abajo, así que 8 y 4 ya son del
 * escalón de arriba — es donde una comparación con `>` en vez de `>=` se
 * equivocaría sin que nada más lo note.
 */
describe('Medidor — menos-es-mejor (vacío verde, lleno rojo)', () => {
  it.each([
    [0, 'bajo'],
    [3.99, 'bajo'],
    [4, 'medio'],
    [7.99, 'medio'],
    [8, 'alto'],
    [9.99, 'alto'],
    [10, 'tope'],
  ] as const)('%s de 10 es %s', (valor, escalon) => {
    expect(pintar(valor, 10, 'menos-es-mejor')).toBe(BAJO_ES_VERDE[escalon]);
  });
});

describe('Medidor — mas-es-mejor (lleno verde, vacío rojo)', () => {
  it.each([
    [0, 'bajo'],
    [3.99, 'bajo'],
    [4, 'medio'],
    [7.99, 'medio'],
    [8, 'alto'],
    [9.99, 'alto'],
    [10, 'tope'],
  ] as const)('%s de 10 es %s', (valor, escalon) => {
    expect(pintar(valor, 10, 'mas-es-mejor')).toBe(BAJO_ES_ROJO[escalon]);
  });

  it('es exactamente la inversa: mismo valor, color del extremo opuesto', () => {
    expect(pintar(10, 10, 'mas-es-mejor')).toBe(BAJO_ES_VERDE.bajo);
  });
});

describe('Medidor — proporción, no valor absoluto', () => {
  it('8 de 22 no es lo mismo que 8 de 10: sobre un cupo grande (36%) sigue siendo poco', () => {
    expect(pintar(8, 22, 'menos-es-mejor')).toBe(BAJO_ES_VERDE.bajo);
    cleanup();
    expect(pintar(8, 10, 'menos-es-mejor')).toBe(BAJO_ES_VERDE.alto);
  });

  it('un cupo de 2: 1 de 2 es la mitad, no "casi vacío"', () => {
    expect(pintar(1, 2, 'menos-es-mejor')).toBe(BAJO_ES_VERDE.medio);
  });
});

describe('Medidor — el arco', () => {
  it('se llena en proporción: la mitad deja la mitad del trazo por recorrer', () => {
    render(<Medidor valor={5} maximo={10} sentido="menos-es-mejor" label="m" />);

    expect(relleno().getAttribute('stroke-dashoffset')).toBe('50');
  });

  it('nunca se sale de su pista: un valor de más se recorta al 100%', () => {
    render(<Medidor valor={12} maximo={10} sentido="menos-es-mejor" label="m" />);

    expect(relleno().getAttribute('stroke-dashoffset')).toBe('0');
    expect(relleno().getAttribute('stroke')).toBe(BAJO_ES_VERDE.tope);
  });

  it('un valor negativo se recorta a vacío', () => {
    render(<Medidor valor={-3} maximo={10} sentido="menos-es-mejor" label="m" />);

    expect(relleno().getAttribute('stroke-dashoffset')).toBe('100');
  });

  it.each([
    ['un máximo de 0', 5, 0],
    ['un máximo negativo', 5, -10],
    ['un valor NaN', Number.NaN, 10],
    ['un máximo infinito', 5, Number.POSITIVE_INFINITY],
  ])('%s dibuja el arco vacío en vez de romperse con NaN', (_caso, valor, maximo) => {
    render(<Medidor valor={valor} maximo={maximo} sentido="menos-es-mejor" label="m" />);

    expect(relleno().getAttribute('stroke-dashoffset')).toBe('100');
  });
});

describe('Medidor — accesibilidad', () => {
  it('el nombre accesible es el label, en un solo lugar', () => {
    render(<Medidor valor={8} maximo={10} sentido="menos-es-mejor" label="Anotados: 8 de 10" />);

    expect(screen.getByRole('img', { name: 'Anotados: 8 de 10' })).toBeTruthy();
  });

  it('el número del centro es decorativo: el lector no lo lee dos veces', () => {
    render(<Medidor valor={8} maximo={10} sentido="menos-es-mejor" label="Anotados: 8 de 10" />);

    expect(screen.getByText('8/10').getAttribute('aria-hidden')).toBe('true');
  });

  it('el arco es decorativo', () => {
    render(<Medidor valor={8} maximo={10} sentido="menos-es-mejor" label="m" />);

    expect(document.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Medidor — el centro', () => {
  it('por defecto muestra valor/maximo', () => {
    render(<Medidor valor={7} maximo={10} sentido="menos-es-mejor" label="m" />);

    expect(screen.getByText('7/10')).toBeTruthy();
  });

  it('se puede reemplazar: el formato es del producto, no de la librería', () => {
    render(
      <Medidor valor={7} maximo={10} sentido="mas-es-mejor" label="m">
        70%
      </Medidor>,
    );

    expect(screen.getByText('70%')).toBeTruthy();
    expect(screen.queryByText('7/10')).toBeNull();
  });
});
