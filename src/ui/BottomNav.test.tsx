// @vitest-environment jsdom
import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { BottomNav, type BottomNavItem } from './BottomNav';

afterEach(cleanup);

// jsdom no evalúa media queries: la barra queda en su `display: none` de base y
// sale del árbol accesible. Por eso las consultas van con `hidden: true`.

function cssDelDocumento(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((tag) => tag.textContent)
    .join('\n');
}

const ITEMS: BottomNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: <svg data-testid="icono-inicio" />, href: '/' },
  { id: 'jugar', label: 'Jugar', icon: <svg />, href: '/play' },
];

function renderNav(props: Partial<Parameters<typeof BottomNav>[0]> = {}) {
  return render(<BottomNav items={ITEMS} activeId="jugar" maxWidth={640} ariaLabel="Secciones" {...props} />);
}

describe('BottomNav — destinos', () => {
  it('cada ítem es un link a su href, con su rótulo como nombre', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Inicio', hidden: true }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Jugar', hidden: true }).getAttribute('href')).toBe('/play');
  });

  it('el nav lleva el nombre accesible que pasa el producto', () => {
    renderNav();
    // Oculto, el nav no calcula nombre accesible en jsdom: se mira el atributo.
    expect(screen.getByRole('navigation', { hidden: true }).getAttribute('aria-label')).toBe('Secciones');
  });

  it('el ícono es decorativo: el rótulo ya lo nombra', () => {
    renderNav();
    expect(screen.getByTestId('icono-inicio').closest('[aria-hidden="true"]')).toBeTruthy();
  });
});

describe('BottomNav — activo', () => {
  it('sólo el ítem de activeId lleva aria-current="page"', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Jugar', hidden: true }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Inicio', hidden: true }).getAttribute('aria-current')).toBeNull();
  });

  it('con activeId null no hay ninguno activo', () => {
    renderNav({ activeId: null });
    for (const link of screen.getAllByRole('link', { hidden: true })) {
      expect(link.getAttribute('aria-current')).toBeNull();
    }
  });
});

describe('BottomNav — navegación', () => {
  it('linkAs reemplaza al <a> pelado', () => {
    const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => (
      <a ref={ref} data-router="si" {...props} />
    ));
    renderNav({ linkAs: Link });
    expect(screen.getByRole('link', { name: 'Inicio', hidden: true }).getAttribute('data-router')).toBe('si');
  });

  it('onSelect recibe el ítem, y preventDefault cancela la navegación', async () => {
    const vistos: { id: string; cancelado: boolean }[] = [];
    renderNav({
      onSelect: (item, evento) => {
        evento.preventDefault();
        vistos.push({ id: item.id, cancelado: evento.defaultPrevented });
      },
    });

    await userEvent.click(screen.getByRole('link', { name: 'Inicio', hidden: true }));

    expect(vistos).toEqual([{ id: 'inicio', cancelado: true }]);
  });
});

describe('BottomNav — offset', () => {
  it('publica --kz-bottom-nav-offset bajo su propio corte mientras está montada', () => {
    const { unmount } = renderNav({ maxWidth: 767 });
    expect(cssDelDocumento()).toMatch(/max-width:\s*767px[^}]*--kz-bottom-nav-offset/);

    unmount();
    expect(cssDelDocumento()).not.toContain('--kz-bottom-nav-offset');
  });
});
