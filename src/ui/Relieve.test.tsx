// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Relieve } from './Relieve';

afterEach(cleanup);

describe('Relieve', () => {
  it('no interpone nada entre el click y el hijo: el rol y el nombre son del hijo', () => {
    render(
      <Relieve>
        <button type="button">Perfil</button>
      </Relieve>,
    );

    expect(screen.getByRole('button', { name: 'Perfil' })).toBeTruthy();
  });

  it('sin $prendido usa el relieve en reposo', () => {
    render(
      <Relieve data-testid="relieve">
        <button type="button">Perfil</button>
      </Relieve>,
    );

    expect(getComputedStyle(screen.getByTestId('relieve')).boxShadow).toBe('var(--kz-relief-out)');
  });

  it('con $prendido usa el relieve hundido', () => {
    render(
      <Relieve data-testid="relieve" $prendido>
        <button type="button">Perfil</button>
      </Relieve>,
    );

    expect(getComputedStyle(screen.getByTestId('relieve')).boxShadow).toBe('var(--kz-relief-in)');
  });
});
