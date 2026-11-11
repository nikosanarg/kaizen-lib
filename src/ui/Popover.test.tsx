// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

afterEach(cleanup);

describe('Popover', () => {
  it('el disparador anuncia que abre un diálogo y si está expandido', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Filtros</button>} title="Filtrar">
        <input aria-label="Nombre" />
      </Popover>,
    );
    const boton = screen.getByRole('button', { name: 'Filtros' });
    expect(boton.getAttribute('aria-expanded')).toBe('false');

    await user.click(boton);

    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'Filtrar' })).toBeTruthy();
  });

  it('se abre con Enter, Esc lo cierra y el foco vuelve al disparador', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Filtros</button>} label="Filtros de la lista">
        <input aria-label="Nombre" />
      </Popover>,
    );

    await user.tab();
    await user.keyboard('{Enter}');
    const dialogo = await screen.findByRole('dialog', { name: 'Filtros de la lista' });
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filtros' }));
  });

  it('el contenido como función puede cerrarlo', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={<button>Filtros</button>} label="Filtros" onOpenChange={onOpenChange}>
        {({ close }) => <button onClick={close}>Aplicar</button>}
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    await user.click(await screen.findByRole('button', { name: 'Aplicar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('controlado: respeta `open` de afuera', () => {
    render(
      <Popover trigger={<button>Filtros</button>} label="Filtros" open>
        contenido
      </Popover>,
    );
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeTruthy();
  });
});
