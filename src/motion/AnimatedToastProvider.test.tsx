// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useToast } from '../ui/Toast';
import type { ToastApi } from '../ui/Toast';
import { AnimatedToastProvider } from './AnimatedToastProvider';
import { MotionProvider } from './MotionProvider';

afterEach(cleanup);

let api: ToastApi;
function Captura() {
  api = useToast();
  return null;
}

describe('AnimatedToastProvider', () => {
  it('anuncia en la región y se desmonta al terminar la salida', async () => {
    render(
      <MotionProvider>
        <AnimatedToastProvider>
          <Captura />
        </AnimatedToastProvider>
      </MotionProvider>,
    );
    act(() => {
      api.success('Guardado', { duration: null });
    });
    expect((await screen.findByRole('status')).textContent).toContain('Guardado');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Cerrar' }), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Guardado')).toBeNull());
  });
});
