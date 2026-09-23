// @vitest-environment jsdom
import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

afterEach(cleanup);

describe('Modal', () => {
  it('no dibuja nada cerrado', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Eliminar">
        contenido
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('el título es el nombre accesible', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Eliminar cepa">
        contenido
      </Modal>,
    );

    expect(await screen.findByRole('dialog', { name: 'Eliminar cepa' })).toBeTruthy();
  });

  it('sin título, ariaLabel es el nombre accesible', async () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Confirmación">
        contenido
      </Modal>,
    );

    expect(await screen.findByRole('dialog', { name: 'Confirmación' })).toBeTruthy();
  });

  it('la X cierra', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Eliminar">
        contenido
      </Modal>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closeLabel pisa el nombre accesible del botón de cierre', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Delete" closeLabel="Close">
        contenido
      </Modal>,
    );

    expect(await screen.findByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('Escape cierra', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Eliminar">
        contenido
      </Modal>,
    );
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('click en el overlay cierra por default', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Eliminar">
        contenido
      </Modal>,
    );
    const overlay = (await screen.findByRole('dialog')).parentElement as HTMLElement;

    fireEvent.mouseDown(overlay);
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('con dismissOnOverlay=false, el overlay no cierra', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Eliminar" dismissOnOverlay={false}>
        contenido
      </Modal>,
    );
    const overlay = (await screen.findByRole('dialog')).parentElement as HTMLElement;

    fireEvent.mouseDown(overlay);
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disableClose bloquea la X, el overlay y Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Guardando..." disableClose>
        contenido
      </Modal>,
    );
    const dialog = await screen.findByRole('dialog');
    const overlay = dialog.parentElement as HTMLElement;

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.mouseDown(overlay);
    fireEvent.click(overlay);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: 'Cerrar' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('atrapa el foco: Tab desde el último control vuelve al primero', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Eliminar" showClose={false}>
        <button type="button">Cancelar</button>
        <button type="button">Confirmar</button>
      </Modal>,
    );
    const ultimo = await screen.findByRole('button', { name: 'Confirmar' });
    ultimo.focus();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
  });

  it('devuelve el foco a quien abrió el modal al cerrar', async () => {
    function Envoltorio() {
      const [abierto, setAbierto] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setAbierto(true)}>
            Abrir
          </button>
          <Modal open={abierto} onClose={() => setAbierto(false)} title="Eliminar">
            contenido
          </Modal>
        </div>
      );
    }

    render(<Envoltorio />);
    const disparador = screen.getByRole('button', { name: 'Abrir' });
    disparador.focus();
    fireEvent.click(disparador);
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {});

    expect(document.activeElement).toBe(disparador);
  });

  it('anidado: Escape sólo cierra el de más arriba de la pila', async () => {
    const cerrarBase = vi.fn();
    const cerrarAnidado = vi.fn();
    render(
      <div>
        <Modal open onClose={cerrarBase} title="Formulario">
          contenido
        </Modal>
        <Modal open onClose={cerrarAnidado} title="Confirmar">
          ¿Seguro?
        </Modal>
      </div>,
    );
    await screen.findAllByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(cerrarAnidado).toHaveBeenCalledOnce();
    expect(cerrarBase).not.toHaveBeenCalled();
  });

  it('description se dibuja bajo el título', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Eliminar" description="Esta acción no se puede deshacer.">
        contenido
      </Modal>,
    );

    expect(await screen.findByText('Esta acción no se puede deshacer.')).toBeTruthy();
  });

  it('footer se dibuja cuando se pasa', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Eliminar" footer={<button type="button">Confirmar</button>}>
        contenido
      </Modal>,
    );

    expect(await screen.findByRole('button', { name: 'Confirmar' })).toBeTruthy();
  });
});
