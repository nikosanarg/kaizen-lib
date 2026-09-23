// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './Badge';

afterEach(cleanup);

describe('Badge — contenido', () => {
  it('muestra su children', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeTruthy();
  });

  it('acepta className para casos que un producto no repite en otro consumidor', () => {
    render(<Badge className="mi-clase">Activo</Badge>);
    expect(screen.getByText('Activo').className).toContain('mi-clase');
  });
});

describe('Badge — tono', () => {
  it('cada tono pinta fondo y texto distintos entre sí', () => {
    const tonos = ['neutral', 'accent', 'success', 'danger', 'warning', 'info'] as const;
    const vistos = new Set<string>();

    for (const tono of tonos) {
      const { unmount } = render(<Badge tone={tono}>{tono}</Badge>);
      const estilo = getComputedStyle(screen.getByText(tono));
      vistos.add(`${estilo.backgroundColor}|${estilo.color}`);
      unmount();
    }

    expect(vistos.size).toBe(tonos.length);
  });

  it('sin tone, es neutral', () => {
    render(<Badge>Default</Badge>);
    const conTono = getComputedStyle(screen.getByText('Default'));

    render(<Badge tone="neutral">Explícito</Badge>);
    const explicito = getComputedStyle(screen.getByText('Explícito'));

    expect(conTono.backgroundColor).toBe(explicito.backgroundColor);
    expect(conTono.color).toBe(explicito.color);
  });
});

describe('Badge — bordered', () => {
  // jsdom no resuelve var(--kz-*) al calcular estilos (no carga defaults.css), así
  // que el color de borde no es observable acá — se compara la regla generada en
  // vez del color calculado, que sí distingue bordered de no-bordered.
  it('bordered genera una clase de estilo distinta a la default', () => {
    const { container: sinBorde } = render(<Badge tone="danger">Sin borde</Badge>);
    const { container: conBorde } = render(
      <Badge tone="danger" bordered>
        Con borde
      </Badge>,
    );

    const claseSinBorde = (sinBorde.firstChild as HTMLElement).className;
    const claseConBorde = (conBorde.firstChild as HTMLElement).className;

    expect(claseSinBorde).not.toBe(claseConBorde);
  });
});
