// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReactionButton } from './ReactionButton';

const Icono = () => <svg data-testid="icono" />;

afterEach(cleanup);

describe('ReactionButton — nombre accesible y estado', () => {
  it('expone el label como nombre accesible', () => {
    render(
      <ReactionButton label="Me gusta">
        <Icono />
      </ReactionButton>,
    );

    expect(screen.getByRole('button', { name: 'Me gusta' })).toBeTruthy();
  });

  it('active se anuncia con aria-pressed, siempre presente (a diferencia de IconButton)', () => {
    const { rerender } = render(
      <ReactionButton label="Me gusta" active>
        <Icono />
      </ReactionButton>,
    );
    expect(screen.getByRole('button', { name: 'Me gusta' }).getAttribute('aria-pressed')).toBe('true');

    rerender(
      <ReactionButton label="Me gusta">
        <Icono />
      </ReactionButton>,
    );
    expect(screen.getByRole('button', { name: 'Me gusta' }).getAttribute('aria-pressed')).toBe('false');
  });
});

describe('ReactionButton — cuenta', () => {
  it('sin count no dibuja nada', () => {
    const { container } = render(
      <ReactionButton label="Me gusta">
        <Icono />
      </ReactionButton>,
    );

    expect(container.textContent).toBe('');
  });

  it('con count en 0 lo muestra: "0 me gusta" es un dato, no una ausencia', () => {
    render(
      <ReactionButton label="Me gusta" count={0}>
        <Icono />
      </ReactionButton>,
    );

    expect(screen.getByText('0')).toBeTruthy();
  });

  it('la cuenta es aria-hidden: la cifra que importa va en el label', () => {
    render(
      <ReactionButton label="Me gusta, 24" count={24}>
        <Icono />
      </ReactionButton>,
    );

    expect(screen.getByText('24').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Me gusta, 24' })).toBeTruthy();
  });
});

describe('ReactionButton — no tiñe el fondo, a diferencia de IconButton', () => {
  it('el fondo es transparente activo o no', () => {
    const { rerender } = render(
      <ReactionButton label="Me gusta" tone="danger" active>
        <Icono />
      </ReactionButton>,
    );
    expect(getComputedStyle(screen.getByRole('button')).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    rerender(
      <ReactionButton label="Me gusta" tone="danger">
        <Icono />
      </ReactionButton>,
    );
    expect(getComputedStyle(screen.getByRole('button')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('ReactionButton — comportamiento', () => {
  it('llama a onClick al presionarlo', async () => {
    const onClick = vi.fn();
    render(
      <ReactionButton label="Me gusta" onClick={onClick}>
        <Icono />
      </ReactionButton>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Me gusta' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con motivo no dispara onClick y muestra el motivo', async () => {
    const onClick = vi.fn();
    render(
      <ReactionButton label="Me gusta" motivo="Iniciá sesión para reaccionar" onClick={onClick}>
        <Icono />
      </ReactionButton>,
    );
    const boton = screen.getByRole('button', { name: 'Me gusta' });

    await userEvent.click(boton);

    expect(onClick).not.toHaveBeenCalled();
    expect(boton.getAttribute('aria-disabled')).toBe('true');
    expect(boton.getAttribute('title')).toBe('Iniciá sesión para reaccionar');
  });
});
