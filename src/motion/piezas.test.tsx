// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedNumber, pasoVisible } from './AnimatedNumber';
import { MotionProvider } from './MotionProvider';
import { Pressable } from './Pressable';
import { Reveal } from './Reveal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const reducirMovimiento = (reducir: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (q: string) =>
      ({
        matches: reducir && q.includes('reduce'),
        media: q,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );

const visible = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]')!.textContent;

describe('AnimatedNumber', () => {
  it('cuenta hasta el valor con el formato Intl pedido', async () => {
    reducirMovimiento(false);
    const { container } = render(
      <AnimatedNumber value={1500} formato={{ style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }} />,
    );
    const final = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(1500);
    expect(visible(container)).not.toBe(final);
    await waitFor(() => expect(visible(container)).toBe(final), { timeout: 4000 });
  });

  it('el lector lee sólo el valor final, desde el primer cuadro', () => {
    reducirMovimiento(false);
    const { container } = render(<AnimatedNumber value={1200} />);
    const lector = Array.from(container.querySelectorAll('span span')).find((s) => !s.hasAttribute('aria-hidden'));
    expect(lector?.textContent).toBe('1.200');
  });

  it('con reduced motion salta directo al valor', () => {
    reducirMovimiento(true);
    const { container } = render(<AnimatedNumber value={48} />);
    expect(visible(container)).toBe('48');
  });

  it('sin dato muestra la raya, no un cero', () => {
    render(<AnimatedNumber value={null} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('los pasos de un destino entero son enteros', () => {
    expect(pasoVisible(312.457, 500)).toBe(312);
    expect(pasoVisible(1.25, 2.5)).toBe(1.25);
  });
});

describe('Reveal', () => {
  let disparar: (visible: boolean) => void = () => {};
  beforeEach(() => {
    reducirMovimiento(false);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private el: Element[] = [];
        constructor(private cb: IntersectionObserverCallback) {
          disparar = (v) =>
            this.cb(
              this.el.map((target) => ({ isIntersecting: v, target }) as unknown as IntersectionObserverEntry),
              this as never,
            );
        }
        observe(el: Element) {
          this.el.push(el);
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('arranca oculto y aparece al entrar en pantalla', async () => {
    render(
      <MotionProvider>
        <Reveal preset="fade">
          <p>hola</p>
        </Reveal>
      </MotionProvider>,
    );
    const caja = screen.getByText('hola').parentElement!;
    expect(caja.style.opacity).toBe('0');
    disparar(true);
    await waitFor(() => expect(caja.style.opacity).toBe('1'));
  });

  it('con escalonado envuelve cada hijo para entrar por turno', async () => {
    render(
      <MotionProvider>
        <Reveal escalonado={0.01}>
          <p>a</p>
          <p>b</p>
        </Reveal>
      </MotionProvider>,
    );
    const a = screen.getByText('a').parentElement!;
    const b = screen.getByText('b').parentElement!;
    expect(a).not.toBe(b);
    expect(a.style.opacity).toBe('0');
    disparar(true);
    await waitFor(() => expect(b.style.opacity).toBe('1'));
  });
});

describe('Pressable', () => {
  it('es un botón nativo de tipo button, enfocable y que responde a teclado y click', () => {
    const onClick = vi.fn();
    render(
      <MotionProvider>
        <Pressable onClick={onClick}>Guardar</Pressable>
      </MotionProvider>,
    );
    const b = screen.getByRole('button', { name: 'Guardar' });
    expect(b.getAttribute('type')).toBe('button');
    b.focus();
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: 'Enter' });
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('como enlace conserva href y el rol de link', () => {
    render(
      <MotionProvider>
        <Pressable as="a" href="/curso/1">
          Curso
        </Pressable>
      </MotionProvider>,
    );
    expect(screen.getByRole('link', { name: 'Curso' }).getAttribute('href')).toBe('/curso/1');
  });

  it('deshabilitado queda deshabilitado', () => {
    render(
      <MotionProvider>
        <Pressable disabled>Enviar</Pressable>
      </MotionProvider>,
    );
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
