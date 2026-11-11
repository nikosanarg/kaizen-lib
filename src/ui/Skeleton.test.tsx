// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

afterEach(cleanup);

const barras = (c: HTMLElement) => c.querySelectorAll('[data-skeleton]');

describe('Skeleton', () => {
  it('anuncia la carga una sola vez: status ocupado con nombre, barras ocultas', () => {
    const { container } = render(<Skeleton lines={3} label="Cargando pedidos" />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(status.textContent).toBe('Cargando pedidos');
    expect(barras(container)).toHaveLength(3);
    barras(container).forEach((b) => expect(b.getAttribute('aria-hidden')).toBe('true'));
  });

  it('el último renglón de un párrafo sale más corto', () => {
    const { container } = render(<Skeleton lines={2} />);
    const [a, b] = Array.from(barras(container));
    expect(getComputedStyle(a!).width).toBe('100%');
    expect(getComputedStyle(b!).width).toBe('60%');
  });

  it('circle es redondo y cuadrado por defecto; block ignora lines', () => {
    const { container, unmount } = render(<Skeleton variant="circle" width="32px" />);
    const c = getComputedStyle(barras(container)[0]!);
    expect(c.borderRadius).toBe('50%');
    expect(c.height).toBe('32px');
    unmount();
    const r = render(<Skeleton variant="block" lines={4} height="80px" />);
    expect(barras(r.container)).toHaveLength(1);
    expect(getComputedStyle(barras(r.container)[0]!).height).toBe('80px');
  });

  it('el pulso se apaga con prefers-reduced-motion', () => {
    render(<Skeleton />);
    const css = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent)
      .join('');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce\)\{[^}]*animation:\s*none/);
  });
});
