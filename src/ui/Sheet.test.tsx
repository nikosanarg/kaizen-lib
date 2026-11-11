// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';
import { Sheet } from './Sheet';

afterEach(cleanup);

describe('Sheet', () => {
  it('es un diálogo modal con el título como nombre', async () => {
    render(
      <Sheet open onClose={vi.fn()} title="Elegir cancha" altura="media">
        <button type="button">Cancha 1</button>
      </Sheet>,
    );
    const dialogo = await screen.findByRole('dialog', { name: 'Elegir cancha' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('foco adentro al abrir y de vuelta al cerrar', async () => {
    const { rerender } = render(
      <>
        <button type="button">abrir</button>
        <Sheet open={false} onClose={vi.fn()} title="Hoja">
          <button type="button">ok</button>
        </Sheet>
      </>,
    );
    const abrir = screen.getByText('abrir');
    abrir.focus();
    rerender(
      <>
        <button type="button">abrir</button>
        <Sheet open onClose={vi.fn()} title="Hoja">
          <button type="button">ok</button>
        </Sheet>
      </>,
    );
    const dialogo = await screen.findByRole('dialog');
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));
    rerender(
      <>
        <button type="button">abrir</button>
        <Sheet open={false} onClose={vi.fn()} title="Hoja">
          <button type="button">ok</button>
        </Sheet>
      </>,
    );
    expect(document.activeElement).toBe(abrir);
  });

  it('Escape cierra, salvo ocupado', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Sheet open onClose={onClose} title="Hoja">
        x
      </Sheet>,
    );
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(
      <Sheet open onClose={onClose} title="Hoja" disableClose>
        x
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Drawer', () => {
  it('es un diálogo modal con nombre y Escape cierra', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Planta 14" lado="izquierda">
        <button type="button">Editar</button>
      </Drawer>,
    );
    const dialogo = await screen.findByRole('dialog', { name: 'Planta 14' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
