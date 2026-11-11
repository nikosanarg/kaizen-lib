// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs, type TabItem, type TabsProps } from './Tabs';

afterEach(cleanup);

const ITEMS: TabItem[] = [
  { id: 'a', etiqueta: 'Datos', contenido: <p>panel datos</p> },
  { id: 'b', etiqueta: 'Pagos', contenido: <p>panel pagos</p> },
  { id: 'c', etiqueta: 'Bloqueada', deshabilitada: true, contenido: <p>panel c</p> },
  { id: 'd', etiqueta: 'Historial', contenido: <p>panel historial</p> },
];

const montar = (props: Partial<TabsProps> = {}) => render(<Tabs label="Secciones" items={ITEMS} {...props} />);
const tab = (nombre: string) => screen.getByRole('tab', { name: nombre });
const tecla = (key: string) => fireEvent.keyDown(document.activeElement!, { key });
const elegida = () => screen.getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true')?.textContent;
const tabuladoras = () => screen.getAllByRole('tab').filter((t) => t.tabIndex === 0).map((t) => t.textContent);

describe('Tabs — roles', () => {
  it('tablist con nombre, tabs enlazadas a su tabpanel en ambos sentidos', () => {
    montar();
    expect(screen.getByRole('tablist', { name: 'Secciones' })).toBeTruthy();
    for (const t of screen.getAllByRole('tab')) {
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      expect(panel?.getAttribute('role')).toBe('tabpanel');
      expect(panel?.getAttribute('aria-labelledby')).toBe(t.id);
    }
  });

  it('sólo el panel elegido se ve y se monta; los demás existen vacíos con hidden', () => {
    montar();
    const visible = screen.getByRole('tabpanel');
    expect(visible.textContent).toBe('panel datos');
    expect(screen.getByRole('tabpanel', { name: 'Datos' })).toBe(visible);
    expect(screen.queryByText('panel pagos')).toBeNull();
    expect(document.querySelectorAll('[role="tabpanel"][hidden]')).toHaveLength(3);
  });

  it('mantenerMontados deja el contenido de los ocultos en el DOM', () => {
    montar({ mantenerMontados: true });
    expect(screen.getByText('panel pagos', { selector: 'p' })).toBeTruthy();
  });

  it('la deshabilitada lo dice y no se elige con click', () => {
    const onCambiar = vi.fn();
    montar({ onCambiar });
    fireEvent.click(tab('Bloqueada'));
    expect(onCambiar).not.toHaveBeenCalled();
    expect((tab('Bloqueada') as HTMLButtonElement).disabled).toBe(true);
  });

  it('dibuja el indicador fuera del árbol accesible', () => {
    montar({ variante: 'pastilla' });
    expect(document.querySelector('[data-indicador]')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Tabs — teclado, activación automática', () => {
  it('roving tabindex: una sola pestaña en el orden de Tab', () => {
    montar();
    expect(tabuladoras()).toEqual(['Datos']);
  });

  it('flechas eligen y mueven foco, saltean deshabilitadas y dan la vuelta', () => {
    const onCambiar = vi.fn();
    montar({ onCambiar });
    tab('Datos').focus();
    tecla('ArrowRight');
    expect(elegida()).toBe('Pagos');
    expect(document.activeElement).toBe(tab('Pagos'));
    tecla('ArrowRight');
    expect(elegida()).toBe('Historial');
    tecla('ArrowRight');
    expect(elegida()).toBe('Datos');
    tecla('ArrowLeft');
    expect(elegida()).toBe('Historial');
    expect(tabuladoras()).toEqual(['Historial']);
    expect(onCambiar.mock.calls.map((c) => c[0])).toEqual(['b', 'd', 'a', 'd']);
  });

  it('Home y End van a la primera y a la última habilitada', () => {
    montar();
    tab('Datos').focus();
    tecla('End');
    expect(document.activeElement).toBe(tab('Historial'));
    expect(elegida()).toBe('Historial');
    tecla('Home');
    expect(document.activeElement).toBe(tab('Datos'));
    expect(elegida()).toBe('Datos');
  });

  it('el panel visible sigue a la pestaña elegida', () => {
    montar();
    tab('Datos').focus();
    tecla('ArrowRight');
    expect(screen.getByRole('tabpanel').textContent).toBe('panel pagos');
  });
});

describe('Tabs — teclado, activación manual', () => {
  it('las flechas sólo mueven el foco; Enter y Espacio eligen', () => {
    const onCambiar = vi.fn();
    montar({ activacion: 'manual', onCambiar });
    tab('Datos').focus();
    tecla('ArrowRight');
    expect(document.activeElement).toBe(tab('Pagos'));
    expect(elegida()).toBe('Datos');
    expect(tabuladoras()).toEqual(['Pagos']);
    expect(onCambiar).not.toHaveBeenCalled();
    tecla('Enter');
    expect(elegida()).toBe('Pagos');
    tecla('End');
    tecla(' ');
    expect(elegida()).toBe('Historial');
    expect(onCambiar.mock.calls.map((c) => c[0])).toEqual(['b', 'd']);
  });

  it('al salir de la lista, la pestaña tabulable vuelve a ser la elegida', () => {
    montar({ activacion: 'manual' });
    tab('Datos').focus();
    tecla('ArrowRight');
    fireEvent.blur(tab('Pagos'), { relatedTarget: document.body });
    expect(tabuladoras()).toEqual(['Datos']);
  });
});

describe('Tabs — controlado', () => {
  it('con valor, no cambia sola: avisa y espera', () => {
    const onCambiar = vi.fn();
    montar({ valor: 'b', onCambiar });
    expect(elegida()).toBe('Pagos');
    fireEvent.click(tab('Historial'));
    expect(onCambiar).toHaveBeenCalledWith('d');
    expect(elegida()).toBe('Pagos');
  });

  it('valorInicial elige la primera sin controlar', () => {
    montar({ valorInicial: 'd' });
    expect(elegida()).toBe('Historial');
  });
});
