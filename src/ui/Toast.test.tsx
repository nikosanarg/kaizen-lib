// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';
import type { ToastApi } from './Toast';

afterEach(cleanup);

let api: ToastApi;
function Captura() {
  api = useToast();
  return null;
}

const montar = () => {
  render(
    <ToastProvider>
      <Captura />
    </ToastProvider>,
  );
};

describe('Toast — anuncio', () => {
  it('info y éxito entran a la región polite; error, a la assertive', () => {
    montar();
    const status = screen.getByRole('status');
    const alerta = screen.getByRole('alert');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(alerta.getAttribute('aria-live')).toBe('assertive');

    act(() => {
      api.success('Guardado');
      api.error('No se pudo borrar');
    });
    expect(status.textContent).toContain('Guardado');
    expect(alerta.textContent).toContain('No se pudo borrar');
    expect(status.textContent).not.toContain('No se pudo');
  });

  it('fuera del provider, useToast tira', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Captura />)).toThrow(/ToastProvider/);
  });
});

describe('Toast — cierre automático', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('se cierra solo a los 5 s; con duration null, no', () => {
    montar();
    act(() => {
      api.info('Efímero');
      api.info('Fijo', { duration: null });
    });
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByText('Efímero')).toBeNull();
    expect(screen.getByText('Fijo')).toBeTruthy();
  });

  it('hover pausa y conserva el tiempo restante', () => {
    montar();
    act(() => {
      api.info('Hola', { duration: 1000 });
    });
    const item = screen.getByText('Hola').closest('[data-tone]') as HTMLElement;
    act(() => vi.advanceTimersByTime(600));
    fireEvent.mouseEnter(item);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Hola')).toBeTruthy();
    fireEvent.mouseLeave(item);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText('Hola')).toBeTruthy();
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByText('Hola')).toBeNull();
  });

  it('el foco adentro pausa', () => {
    montar();
    act(() => {
      api.info('Hola', { duration: 1000 });
    });
    act(() => screen.getByRole('button', { name: 'Cerrar' }).focus());
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Hola')).toBeTruthy();
    act(() => screen.getByRole('button', { name: 'Cerrar' }).blur());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Hola')).toBeNull();
  });
});

describe('Toast — teclado y acciones', () => {
  it('Escape con el foco adentro cierra; Enter en la X también', () => {
    montar();
    act(() => {
      api.info('Uno', { duration: null });
      api.info('Dos', { duration: null });
    });
    const [cerrarUno] = screen.getAllByRole('button', { name: 'Cerrar' });
    act(() => cerrarUno!.focus());
    fireEvent.keyDown(cerrarUno!, { key: 'Escape' });
    expect(screen.queryByText('Uno')).toBeNull();

    const cerrarDos = screen.getByRole('button', { name: 'Cerrar' });
    fireEvent.click(cerrarDos);
    expect(screen.queryByText('Dos')).toBeNull();
  });

  it('la acción corre y cierra el toast', () => {
    montar();
    const onClick = vi.fn();
    act(() => {
      api.error('Falló', { action: { label: 'Reintentar', onClick } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Falló')).toBeNull();
  });

  it('respeta max descartando el más viejo', () => {
    montar();
    act(() => {
      for (const n of ['a', 'b', 'c', 'd']) api.info(n, { duration: null });
    });
    expect(screen.queryByText('a')).toBeNull();
    expect(screen.getByText('d')).toBeTruthy();
  });
});
