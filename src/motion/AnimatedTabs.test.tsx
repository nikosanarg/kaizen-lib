// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AnimatedTabs } from './AnimatedTabs';
import { MotionProvider } from './MotionProvider';

afterEach(cleanup);

describe('AnimatedTabs', () => {
  it('mantiene roles y teclado de Tabs, con el indicador de motion', () => {
    render(
      <MotionProvider>
        <AnimatedTabs
          label="Secciones"
          variante="pastilla"
          items={[
            { id: 'a', etiqueta: 'Uno', contenido: 'uno' },
            { id: 'b', etiqueta: 'Dos', contenido: 'dos' },
          ]}
        />
      </MotionProvider>,
    );
    expect(screen.getByRole('tablist', { name: 'Secciones' })).toBeTruthy();
    expect(document.querySelector('[data-indicador]')?.getAttribute('aria-hidden')).toBe('true');
    const uno = screen.getByRole('tab', { name: 'Uno' });
    uno.focus();
    fireEvent.keyDown(uno, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Dos' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('dos');
  });
});
