// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LangSelector, type OpcionDeIdioma } from './LangSelector';

const OPCIONES: OpcionDeIdioma<'es' | 'en' | 'pt'>[] = [
  { codigo: 'es', nombre: 'Español', icono: <span data-testid="bandera-es" /> },
  { codigo: 'en', nombre: 'English', icono: <span data-testid="bandera-en" /> },
  { codigo: 'pt', nombre: 'Português', icono: <span data-testid="bandera-pt" /> },
];

afterEach(cleanup);

describe('LangSelector', () => {
  it('muestra el ícono del idioma actual', () => {
    render(<LangSelector opciones={OPCIONES} actual="en" onChange={vi.fn()} />);

    expect(screen.getByTestId('bandera-en')).toBeTruthy();
    expect(screen.queryByTestId('bandera-es')).toBeNull();
  });

  it('el nombre accesible anuncia el idioma AL QUE SE PASA, no el actual', () => {
    render(<LangSelector opciones={OPCIONES} actual="es" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cambiar idioma a English' })).toBeTruthy();
  });

  it('onChange recibe el código de la siguiente opción, no la actual', async () => {
    const onChange = vi.fn();
    render(<LangSelector opciones={OPCIONES} actual="es" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('en');
  });

  it('cicla: la última opción vuelve a la primera', async () => {
    const onChange = vi.fn();
    render(<LangSelector opciones={OPCIONES} actual="pt" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('es');
  });

  it('un `actual` que no está entre las opciones no rompe: cae a la primera', () => {
    render(<LangSelector opciones={OPCIONES} actual={'fr' as 'es'} onChange={vi.fn()} />);

    expect(screen.getByTestId('bandera-es')).toBeTruthy();
  });

  it('sin opciones no dibuja nada', () => {
    const { container } = render(<LangSelector opciones={[]} actual="es" onChange={vi.fn()} />);

    expect(container.textContent).toBe('');
  });
});
