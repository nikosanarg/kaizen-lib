// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

const Icono = () => <svg data-testid="icono" />;

afterEach(cleanup);

describe('IconButton — nombre accesible', () => {
  it('expone el label como nombre accesible y como tooltip', () => {
    render(
      <IconButton label="Cambiar tema">
        <Icono />
      </IconButton>,
    );

    const boton = screen.getByRole('button', { name: 'Cambiar tema' });
    expect(boton.getAttribute('title')).toBe('Cambiar tema');
  });

  it('es un botón que no envía formularios', () => {
    render(
      <IconButton label="Cerrar">
        <Icono />
      </IconButton>,
    );

    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });
});

describe('IconButton — badge', () => {
  it.each([
    [1, '1'],
    [9, '9'],
    [10, '+9'],
    [250, '+9'],
  ])('con %i muestra "%s"', (cantidad, esperado) => {
    render(
      <IconButton label="Notificaciones" badge={cantidad}>
        <Icono />
      </IconButton>,
    );

    expect(screen.getByText(esperado)).toBeTruthy();
  });

  it.each([[0], [-3], [undefined], [Number.NaN]])('con %s no dibuja ningún contador', (cantidad) => {
    const { container } = render(
      <IconButton label="Notificaciones" badge={cantidad}>
        <Icono />
      </IconButton>,
    );

    expect(container.textContent).toBe('');
  });

  it('esconde el número a los lectores de pantalla: la cuenta va en el label', () => {
    render(
      <IconButton label="Notificaciones, 3 sin leer" badge={3}>
        <Icono />
      </IconButton>,
    );

    expect(screen.getByText('3').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Notificaciones, 3 sin leer' })).toBeTruthy();
  });
});

describe('IconButton — estados', () => {
  it('llama a onClick al presionarlo', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Buscar" onClick={onClick}>
        <Icono />
      </IconButton>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con motivo no dispara onClick, sigue enfocable y muestra el motivo', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Publicar" motivo="Falta iniciar sesión" onClick={onClick}>
        <Icono />
      </IconButton>,
    );
    const boton = screen.getByRole('button', { name: 'Publicar' });

    await userEvent.click(boton);
    boton.focus();

    expect(onClick).not.toHaveBeenCalled();
    expect(boton.getAttribute('aria-disabled')).toBe('true');
    expect(boton.hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(boton);
    expect(boton.getAttribute('title')).toBe('Falta iniciar sesión');
  });

  it('encendido se anuncia con aria-pressed; apagado no declara nada', () => {
    const { rerender } = render(
      <IconButton label="Filtro" active>
        <Icono />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Filtro' }).getAttribute('aria-pressed')).toBe('true');

    rerender(
      <IconButton label="Filtro">
        <Icono />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Filtro' }).hasAttribute('aria-pressed')).toBe(false);
  });
});

describe('IconButton — como link', () => {
  it('con as="a" es un link con su href, sin type, y activo marca la página actual', () => {
    render(
      <IconButton as="a" href="/notificaciones" label="Notificaciones" active>
        <Icono />
      </IconButton>,
    );

    const link = screen.getByRole('link', { name: 'Notificaciones' });
    expect(link.getAttribute('href')).toBe('/notificaciones');
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.hasAttribute('aria-pressed')).toBe(false);
  });

  it('un link bloqueado con motivo no navega', async () => {
    const onClick = vi.fn();
    render(
      <IconButton as="a" href="/x" label="Ir" motivo="No disponible" onClick={onClick}>
        <Icono />
      </IconButton>,
    );
    const link = screen.getByRole('link', { name: 'Ir' });
    const evento = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(evento);

    expect(evento.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});
