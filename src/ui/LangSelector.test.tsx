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

/** Frase mínima que sí distingue las dos opciones: alcanza para el test. */
const etiqueta = (siguiente: OpcionDeIdioma<'es' | 'en' | 'pt'>) => `a ${siguiente.nombre}`;

afterEach(cleanup);

describe('LangSelector', () => {
  it('muestra el ícono del idioma actual', () => {
    render(<LangSelector opciones={OPCIONES} actual="en" etiqueta={etiqueta} onChange={vi.fn()} />);

    expect(screen.getByTestId('bandera-en')).toBeTruthy();
    expect(screen.queryByTestId('bandera-es')).toBeNull();
  });

  it('no fija ningún texto propio: label es lo que devuelve `etiqueta`', () => {
    render(<LangSelector opciones={OPCIONES} actual="es" etiqueta={etiqueta} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'a English' })).toBeTruthy();
  });

  it('`etiqueta` recibe la opción siguiente Y la actual, en ese orden', () => {
    const capturada = vi.fn(() => 'x');
    render(<LangSelector opciones={OPCIONES} actual="es" etiqueta={capturada} onChange={vi.fn()} />);

    expect(capturada).toHaveBeenCalledExactlyOnceWith(OPCIONES[1], OPCIONES[0]);
  });

  it('onChange recibe el código de la siguiente opción, no la actual', async () => {
    const onChange = vi.fn();
    render(<LangSelector opciones={OPCIONES} actual="es" etiqueta={etiqueta} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('en');
  });

  it('cicla: la última opción vuelve a la primera', async () => {
    const onChange = vi.fn();
    render(<LangSelector opciones={OPCIONES} actual="pt" etiqueta={etiqueta} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('es');
  });

  it('un `actual` que no está entre las opciones no rompe: cae a la primera', () => {
    render(<LangSelector opciones={OPCIONES} actual={'fr' as 'es'} etiqueta={etiqueta} onChange={vi.fn()} />);

    expect(screen.getByTestId('bandera-es')).toBeTruthy();
  });

  it('sin opciones no dibuja nada', () => {
    const { container } = render(
      <LangSelector opciones={[]} actual="es" etiqueta={etiqueta} onChange={vi.fn()} />,
    );

    expect(container.textContent).toBe('');
  });
});
