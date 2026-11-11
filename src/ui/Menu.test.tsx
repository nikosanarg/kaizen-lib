// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Menu } from './Menu';

afterEach(cleanup);

const armar = () => {
  const editar = vi.fn();
  const duplicar = vi.fn();
  const borrar = vi.fn();
  render(
    <Menu
      label="Acciones del trago"
      items={[
        { label: 'Editar', onSelect: editar },
        { label: 'Duplicar', onSelect: duplicar },
        { label: 'Borrar', onSelect: borrar, danger: true },
      ]}
    />,
  );
  return { editar, duplicar, borrar };
};

const activo = () => document.activeElement?.textContent;

describe('Menu', () => {
  it('sin trigger propio dibuja un botón nombrado con `label`', () => {
    armar();
    const boton = screen.getByRole('button', { name: 'Acciones del trago' });
    expect(boton.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('abre con Enter, recorre con flechas y Enter ejecuta la acción', async () => {
    const user = userEvent.setup();
    const { duplicar } = armar();

    await user.tab();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Editar', 'Duplicar', 'Borrar']);
    await waitFor(() => expect(activo()).toBe('Editar'));

    await user.keyboard('{ArrowDown}');
    expect(activo()).toBe('Duplicar');
    await user.keyboard('{Enter}');

    expect(duplicar).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('typeahead: tipear la inicial lleva a esa acción', async () => {
    const user = userEvent.setup();
    armar();

    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(activo()).toBe('Editar'));

    await user.keyboard('b');
    expect(activo()).toBe('Borrar');
  });

  it('Esc cierra y devuelve el foco al disparador', async () => {
    const user = userEvent.setup();
    const { editar } = armar();

    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Acciones del trago' }));
    expect(editar).not.toHaveBeenCalled();
  });

  it('una acción deshabilitada no se ejecuta', async () => {
    const user = userEvent.setup();
    const borrar = vi.fn();
    render(<Menu items={[{ label: 'Borrar', onSelect: borrar, disabled: true }]} />);

    await user.click(screen.getByRole('button', { name: 'Más acciones' }));
    const item = await screen.findByRole('menuitem', { name: 'Borrar' });
    expect(item.getAttribute('aria-disabled')).toBe('true');
    await user.click(item);
    expect(borrar).not.toHaveBeenCalled();
  });

  it('acepta un disparador propio', () => {
    render(<Menu trigger={<button>Opciones</button>} items={[{ label: 'Editar', onSelect: () => {} }]} />);
    expect(screen.getByRole('button', { name: 'Opciones' }).getAttribute('aria-haspopup')).toBe('menu');
  });
});
