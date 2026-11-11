// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedDrawer } from './AnimatedDrawer';
import { AnimatedSheet } from './AnimatedSheet';
import { MotionProvider } from './MotionProvider';
import { cierraPorArrastre } from './arrastre';

afterEach(cleanup);

function Caso({ onClose = vi.fn(), drawer = false }) {
  const [abierto, setAbierto] = useState(true);
  const cerrar = () => {
    onClose();
    setAbierto(false);
  };
  return (
    <MotionProvider>
      {drawer ? (
        <AnimatedDrawer open={abierto} onClose={cerrar} title="Ficha">
          <button type="button">ok</button>
        </AnimatedDrawer>
      ) : (
        <AnimatedSheet open={abierto} onClose={cerrar} title="Hoja">
          <button type="button">ok</button>
        </AnimatedSheet>
      )}
    </MotionProvider>
  );
}

describe('cierraPorArrastre', () => {
  it('cierra pasado un cuarto del alto', () => {
    expect(cierraPorArrastre(99, 0, 400)).toBe(false);
    expect(cierraPorArrastre(100, 0, 400)).toBe(true);
  });
  it('en un panel alto alcanza el tope en px', () => {
    expect(cierraPorArrastre(160, 0, 2000)).toBe(true);
  });
  it('un tirón rápido cierra aunque el recorrido sea corto', () => {
    expect(cierraPorArrastre(20, 800, 400)).toBe(true);
  });
  it('hacia arriba nunca cierra', () => {
    expect(cierraPorArrastre(-300, 900, 400)).toBe(false);
  });
});

describe('AnimatedSheet', () => {
  it('diálogo con nombre, foco adentro y tirador oculto a lectores', async () => {
    render(<Caso />);
    const dialogo = await screen.findByRole('dialog', { name: 'Hoja' });
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));
    const tirador = dialogo.querySelector('[data-kz-tirador]');
    expect(tirador?.getAttribute('aria-hidden')).toBe('true');
  });

  it('Escape cierra y se desmonta al terminar la salida', async () => {
    const onClose = vi.fn();
    render(<Caso onClose={onClose} />);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('AnimatedDrawer', () => {
  it('diálogo con nombre y Escape cierra', async () => {
    const onClose = vi.fn();
    render(<Caso onClose={onClose} drawer />);
    await screen.findByRole('dialog', { name: 'Ficha' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
