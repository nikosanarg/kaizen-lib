// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

afterEach(cleanup);

describe('Tooltip', () => {
  it('el disparador conserva su propio rol y nombre', () => {
    render(
      <Tooltip content="Copiar enlace">
        <button aria-label="Copiar">C</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeTruthy();
    expect(screen.queryByText('Copiar enlace')).toBeNull();
  });

  it('se abre al enfocar con teclado y se cierra con Esc', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copiar enlace">
        <button aria-label="Copiar">C</button>
      </Tooltip>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Copiar' }));
    await waitFor(() => expect(screen.getByText('Copiar enlace')).toBeTruthy());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Copiar enlace')).toBeNull());
  });

  it('se abre al pasar el puntero', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copiar enlace" delay={0}>
        <button aria-label="Copiar">C</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Copiar enlace')).toBeTruthy());
  });

  it('con `disabled` no se abre', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copiar enlace" disabled>
        <button aria-label="Copiar">C</button>
      </Tooltip>,
    );

    await user.tab();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText('Copiar enlace')).toBeNull();
  });
});
