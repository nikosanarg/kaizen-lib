// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Combobox } from './Combobox';
import type { SelectOption } from './Select';

afterEach(cleanup);

const PACIENTES: SelectOption<number>[] = [
  { value: 1, label: 'Ana Pérez', searchText: 'ana@mail.com' },
  { value: 2, label: 'Bruno Díaz', searchText: 'bruno@mail.com' },
  { value: 3, label: 'Carla Gómez', searchText: 'carla@correo.org' },
];

function Controlado({ onChange = () => {}, inicial = null }: { onChange?: (v: number | null) => void; inicial?: number | null }) {
  const [valor, setValor] = useState<number | null>(inicial);
  return (
    <Combobox
      label="Paciente"
      placeholder="Por asignar"
      options={PACIENTES}
      value={valor}
      onChange={(v) => {
        setValor(v);
        onChange(v);
      }}
    />
  );
}

const campo = () => screen.getByRole('combobox', { name: 'Paciente' });
const opciones = () => screen.getAllByRole('option').map((o) => o.textContent);
const activa = () => {
  const id = campo().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};

describe('Combobox', () => {
  it('es un input con rol combobox, nombrado, que controla un listbox', async () => {
    const user = userEvent.setup();
    render(<Controlado />);
    expect(campo().tagName).toBe('INPUT');

    await user.click(campo());

    const lista = await screen.findByRole('listbox');
    expect(campo().getAttribute('aria-expanded')).toBe('true');
    expect(campo().getAttribute('aria-controls')).toBe(lista.id);
  });

  it('filtra al instante, sin acentos ni mayúsculas', async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.type(campo(), 'perez');

    await waitFor(() => expect(opciones()).toEqual(['Ana Pérez']));
  });

  it('busca también en `searchText`, que no se muestra', async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.type(campo(), 'correo.org');

    await waitFor(() => expect(opciones()).toEqual(['Carla Gómez']));
  });

  it('sin coincidencias muestra el aviso de vacío', async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.type(campo(), 'zzz');

    expect(await screen.findByText('Sin resultados.')).toBeTruthy();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('la primera coincidencia queda activa y Enter la elige; el foco no deja el campo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);

    await user.type(campo(), 'a');
    await waitFor(() => expect(activa()).toBe('Ana Pérez'));
    expect(document.activeElement).toBe(campo());

    await user.keyboard('{ArrowDown}');
    expect(activa()).toBe('Bruno Díaz');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(2);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect((campo() as HTMLInputElement).value).toBe('Bruno Díaz');
  });

  it('flecha abajo con la lista cerrada la abre', async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.tab();
    await user.keyboard('{ArrowDown}');

    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(opciones()).toEqual(['Ana Pérez', 'Bruno Díaz', 'Carla Gómez']);
  });

  it('Esc cierra sin elegir', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);

    await user.type(campo(), 'bru');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(document.activeElement).toBe(campo());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('muestra la etiqueta del valor elegido y se puede limpiar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlado inicial={3} onChange={onChange} />);
    expect((campo() as HTMLInputElement).value).toBe('Carla Gómez');

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    await waitFor(() => expect((campo() as HTMLInputElement).value).toBe(''));
  });

  it('mientras carga, el aviso dice que está cargando', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Paciente" options={[]} value={null} onChange={vi.fn()} loading />);

    await user.click(campo());

    expect(await screen.findByText('Cargando…')).toBeTruthy();
  });
});
