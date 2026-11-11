// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedModal } from './AnimatedModal';
import { MotionProvider } from './MotionProvider';

afterEach(cleanup);

function Caso({ onClose = vi.fn(), disableClose = false }) {
  const [abierto, setAbierto] = useState(true);
  return (
    <MotionProvider>
      <button type="button">afuera</button>
      <AnimatedModal
        open={abierto}
        onClose={() => {
          onClose();
          setAbierto(false);
        }}
        title="Eliminar"
        disableClose={disableClose}
      >
        <button type="button">ok</button>
      </AnimatedModal>
    </MotionProvider>
  );
}

describe('AnimatedModal', () => {
  it('mantiene nombre accesible y foco inicial', async () => {
    render(<Caso />);
    expect(await screen.findByRole('dialog', { name: 'Eliminar' })).toBeTruthy();
    await waitFor(() => expect(document.activeElement?.textContent).toBe('×'));
  });

  it('Escape cierra y el diálogo se desmonta al terminar la salida', async () => {
    const onClose = vi.fn();
    render(<Caso onClose={onClose} />);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('ocupado: Escape no cierra', async () => {
    const onClose = vi.fn();
    render(<Caso onClose={onClose} disableClose />);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
