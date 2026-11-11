// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Select, type SelectOption } from './Select';

afterEach(cleanup);

const OPCIONES: SelectOption[] = [
  { value: 'reciente', label: 'Más reciente' },
  { value: 'nombre', label: 'Nombre' },
  { value: 'precio', label: 'Precio', disabled: true },
  { value: 'popular', label: 'Popularidad' },
];

function Controlado({ onChange = () => {} }: { onChange?: (v: string) => void }) {
  const [valor, setValor] = useState<string | null>(null);
  return (
    <Select
      label="Orden"
      placeholder="Elegí un orden"
      options={OPCIONES}
      value={valor}
      onChange={(v) => {
        setValor(v);
        onChange(v);
      }}
    />
  );
}

describe('Select', () => {
  it('es un combobox nombrado que muestra el placeholder sin valor', () => {
    render(<Controlado />);
    const campo = screen.getByRole('combobox', { name: 'Orden' });
    expect(campo.textContent).toContain('Elegí un orden');
    expect(campo.getAttribute('aria-expanded')).toBe('false');
  });

  it('muestra la etiqueta de la opción elegida', () => {
    render(<Select label="Orden" options={OPCIONES} value="nombre" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Orden' }).textContent).toContain('Nombre');
  });

  it('flechas recorren; Enter sobre una deshabilitada no elige, sobre una habilitada sí', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);

    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeTruthy();
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Más reciente'));

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Precio');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Popularidad');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('popular');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('combobox', { name: 'Orden' }).textContent).toContain('Popularidad');
  });

  it('typeahead con la lista abierta lleva a la opción', async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('n');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Nombre'));
  });

  it('Esc cierra sin elegir y el foco vuelve al campo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Orden' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('la opción elegida queda marcada con aria-selected', async () => {
    const user = userEvent.setup();
    render(<Select label="Orden" options={OPCIONES} value="nombre" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: 'Orden' }));
    const opcion = await screen.findByRole('option', { name: 'Nombre' });
    expect(opcion.getAttribute('aria-selected')).toBe('true');
  });
});
