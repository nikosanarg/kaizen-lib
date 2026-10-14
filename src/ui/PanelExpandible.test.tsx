// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PanelExpandible } from './PanelExpandible';

afterEach(cleanup);

/** Visible = ningún ancestro con `hidden` (jsdom no calcula layout). */
const visible = (el: HTMLElement) => el.closest('[hidden]') === null;

const Contador = () => {
  const [n, setN] = useState(0);
  return <button type="button" onClick={() => setN(n + 1)}>{`Tocado ${n}`}</button>;
};

describe('PanelExpandible — cabecera', () => {
  it('dice el título, el indicador y qué es ese número', () => {
    render(
      <PanelExpandible titulo="Comprometido" indicador="30 g" leyenda="faltan entregar">
        <p>La tabla</p>
      </PanelExpandible>
    );

    expect(screen.getByRole('heading', { name: 'Comprometido' })).toBeTruthy();
    expect(screen.getByText('30 g')).toBeTruthy();
    expect(screen.getByText('faltan entregar')).toBeTruthy();
    expect(visible(screen.getByText('La tabla'))).toBe(true);
  });

  it('con varios indicadores dibuja cada uno con su leyenda', () => {
    render(
      <PanelExpandible titulo="Control" indicadores={[{ valor: '40 g', leyenda: 'entregado' }, { valor: '60 g', leyenda: 'comprometido' }]}>
        <p>x</p>
      </PanelExpandible>
    );

    expect(screen.getByText('40 g')).toBeTruthy();
    expect(screen.getByText('comprometido')).toBeTruthy();
  });
});

describe('PanelExpandible — plegado', () => {
  it('el chevron pliega y vuelve a abrir, y dice en qué estado está', () => {
    render(<PanelExpandible titulo="Lotes"><p>La tabla</p></PanelExpandible>);

    const plegar = screen.getByRole('button', { name: 'Plegar Lotes' });
    expect(plegar.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(plegar);

    expect(visible(screen.getByText('La tabla'))).toBe(false);
    const desplegar = screen.getByRole('button', { name: 'Desplegar Lotes' });
    expect(desplegar.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(desplegar);
    expect(visible(screen.getByText('La tabla'))).toBe(true);
  });

  it('tocar cualquier parte de la cabecera también pliega', () => {
    render(<PanelExpandible titulo="Lotes" indicador="5 g"><p>La tabla</p></PanelExpandible>);

    fireEvent.click(screen.getByRole('heading', { name: 'Lotes' }));

    expect(visible(screen.getByText('La tabla'))).toBe(false);
  });

  it('plegado, el indicador sigue a la vista', () => {
    render(<PanelExpandible titulo="Entregas" indicador="12" abiertoInicial={false}><p>La tabla</p></PanelExpandible>);

    expect(visible(screen.getByText('12'))).toBe(true);
    expect(visible(screen.getByText('La tabla'))).toBe(false);
  });

  it('plegar no desmonta: el contenido conserva su estado', () => {
    render(<PanelExpandible titulo="Lotes"><Contador /></PanelExpandible>);
    fireEvent.click(screen.getByRole('button', { name: 'Tocado 0' }));

    fireEvent.click(screen.getByRole('button', { name: 'Plegar Lotes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desplegar Lotes' }));

    expect(screen.getByRole('button', { name: 'Tocado 1' })).toBeTruthy();
  });

  it('controlado desde afuera, avisa el cambio y no se mueve solo', () => {
    const onCambiar = vi.fn();
    render(<PanelExpandible titulo="Lotes" abierto onCambiar={onCambiar}><p>La tabla</p></PanelExpandible>);

    fireEvent.click(screen.getByRole('button', { name: 'Plegar Lotes' }));

    expect(onCambiar).toHaveBeenCalledWith(false);
    expect(visible(screen.getByText('La tabla'))).toBe(true);
  });

  it('las etiquetas del chevron se pisan para otro idioma', () => {
    render(<PanelExpandible titulo="Lots" etiquetaPlegar="Collapse" etiquetaDesplegar="Expand"><p>x</p></PanelExpandible>);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Lots' }));

    expect(screen.getByRole('button', { name: 'Expand Lots' })).toBeTruthy();
  });
});

describe('PanelExpandible — con plegable={false}', () => {
  it('conserva la cabecera con el indicador y no tiene chevron', () => {
    render(<PanelExpandible titulo="Ciclos" indicador="3" leyenda="activos" plegable={false}><p>x</p></PanelExpandible>);

    expect(screen.getByRole('heading', { name: 'Ciclos' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('un click en la cabecera no lo pliega, ni siquiera si arrancó plegado', () => {
    render(<PanelExpandible titulo="Ciclos" plegable={false} abiertoInicial={false}><p>La tabla</p></PanelExpandible>);

    fireEvent.click(screen.getByRole('heading', { name: 'Ciclos' }));

    expect(visible(screen.getByText('La tabla'))).toBe(true);
  });
});

describe('PanelExpandible — ancho', () => {
  it('el plegable declara su columna: el contenido ancho se compacta en vez de empujar el panel', () => {
    render(<PanelExpandible titulo="Ciclos"><p>La tabla</p></PanelExpandible>);

    const plegable = screen.getByText('La tabla').closest('[id]') as HTMLElement;
    expect(getComputedStyle(plegable).gridTemplateColumns).toBe('minmax(0, 1fr)');
  });
});
