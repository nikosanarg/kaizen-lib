// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Stepper, type PasoStepper } from './Stepper';

afterEach(cleanup);

const PASOS: PasoStepper[] = [
  { etiqueta: 'Datos' },
  { etiqueta: 'Necesidades' },
  { etiqueta: 'Confirmación' },
];

const items = () => screen.getAllByRole('listitem');
const estados = () => items().map((li) => li.getAttribute('data-estado'));

/** El CSS que styled-components inyectó, para leer reglas que jsdom no computa. */
const css = () => Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join('\n');

/** Las reglas de la clase de un elemento, con su `::after` (styled-components le da una clase por variante). */
const reglaDe = (el: Element): string => {
  const reglas = css();
  return Array.from(el.classList)
    .map((c) => reglas.match(new RegExp(`\\.${c}(::after)?\\{[^}]*\\}`, 'g'))?.join('') ?? '')
    .join('');
};

/** Las líneas son el primer hijo de cada paso salvo el último. */
const lineas = () => items().slice(0, -1).map((li) => li.firstElementChild!);
const circulos = () => items().map((li, i, todos) => li.children[i < todos.length - 1 ? 1 : 0]!);

describe('Stepper — estados', () => {
  it('es una lista con nombre, y el paso actual lleva aria-current', () => {
    render(<Stepper label="Pasos de la adhesión" pasos={PASOS} actual={1} />);

    expect(screen.getByRole('list', { name: 'Pasos de la adhesión' })).toBeTruthy();
    expect(estados()).toEqual(['completo', 'actual', 'pendiente']);
    expect(items()[1]!.getAttribute('aria-current')).toBe('step');
    expect(items()[0]!.getAttribute('aria-current')).toBeNull();
  });

  it('recorta un actual fuera de rango', () => {
    const { rerender } = render(<Stepper label="p" pasos={PASOS} actual={9} />);
    expect(estados()).toEqual(['completo', 'completo', 'actual']);

    rerender(<Stepper label="p" pasos={PASOS} actual={-3} />);
    expect(estados()).toEqual(['actual', 'pendiente', 'pendiente']);
  });

  it('sin ícono numera desde 1; con ícono, dibuja el ícono', () => {
    render(<Stepper label="p" pasos={[{ etiqueta: 'A' }, { etiqueta: 'B', icono: <svg data-testid="ico" /> }]} actual={0} />);

    expect(circulos()[0]!.textContent).toBe('1');
    expect(screen.getByTestId('ico')).toBeTruthy();
  });

  it('dibuja una línea menos que pasos, llena hasta el actual', () => {
    render(<Stepper label="p" pasos={PASOS} actual={1} />);

    expect(lineas()).toHaveLength(2);
    expect(reglaDe(lineas()[0]!)).toContain('scaleX(1)');
    expect(reglaDe(lineas()[1]!)).toContain('scaleX(0)');
  });

  it('las etiquetas se leen aunque se oculten a la vista bajo un ancho', () => {
    render(<Stepper label="p" pasos={PASOS} actual={0} ocultarEtiquetasBajo={768} />);

    expect(screen.getByText('Necesidades')).toBeTruthy();
    expect(css()).toMatch(/max-width:\s*767\.98px/);
  });
});

describe('Stepper — animación', () => {
  it('al avanzar, cada línea espera a la anterior y cada círculo a su línea', () => {
    const { rerender } = render(<Stepper label="p" pasos={PASOS} actual={0} duracionMs={200} />);
    rerender(<Stepper label="p" pasos={PASOS} actual={2} duracionMs={200} />);

    expect(reglaDe(lineas()[0]!)).toMatch(/200ms [^;]* 0ms/);
    expect(reglaDe(lineas()[1]!)).toMatch(/200ms [^;]* 200ms/);
    expect(reglaDe(circulos()[1]!)).toContain('transition-delay:200ms');
    expect(reglaDe(circulos()[2]!)).toContain('transition-delay:400ms');
  });

  it('al retroceder, el orden se invierte', () => {
    const { rerender } = render(<Stepper label="p" pasos={PASOS} actual={2} duracionMs={200} />);
    rerender(<Stepper label="p" pasos={PASOS} actual={0} duracionMs={200} />);

    expect(reglaDe(lineas()[1]!)).toMatch(/200ms [^;]* 0ms/);
    expect(reglaDe(lineas()[0]!)).toMatch(/200ms [^;]* 200ms/);
    expect(reglaDe(circulos()[2]!)).toContain('transition-delay:0ms');
    expect(reglaDe(circulos()[1]!)).toContain('transition-delay:200ms');
  });

  it('con animado={false} cambia de una', () => {
    const { rerender } = render(<Stepper label="p" pasos={PASOS} actual={0} animado={false} />);
    rerender(<Stepper label="p" pasos={PASOS} actual={2} animado={false} />);

    expect(reglaDe(circulos()[2]!)).toContain('transition-duration:0ms');
    expect(reglaDe(lineas()[1]!)).toMatch(/0ms [^;]* 0ms/);
  });

  it('respeta prefers-reduced-motion', () => {
    render(<Stepper label="p" pasos={PASOS} actual={0} />);
    expect(css()).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

describe('Stepper — paleta', () => {
  it('lee las variables del componente con los tokens de fallback', () => {
    render(<Stepper label="p" pasos={PASOS} actual={1} />);

    expect(css()).toContain('var(--kz-stepper-pleno, var(--kz-accent))');
    expect(css()).toContain('var(--kz-stepper-pista, var(--kz-hairline-strong))');
  });
});
