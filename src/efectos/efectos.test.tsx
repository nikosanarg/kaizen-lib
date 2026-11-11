// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Beams, Card3D, HeroText, Spotlight, StarField, generarEstrellas } from './index';

/** matchMedia simulado: `reducido` y `hover` definen qué consultas dan `true`. */
function simularMedios({ reducido = false, hover = true } = {}) {
  window.matchMedia = ((q: string) => ({
    matches: q.includes('reduced-motion') ? reducido : q.includes('hover: hover') ? hover : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  simularMedios();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const moverMouse = (el: Element, x: number, y: number) =>
  act(() => {
    el.dispatchEvent(Object.assign(new Event('pointermove', { bubbles: true }), { pointerType: 'mouse', clientX: x, clientY: y }));
  });

describe('Spotlight', () => {
  it('renderiza el contenido y sigue al mouse', () => {
    render(
      <Spotlight data-testid="s">
        <a href="#x">entrar</a>
      </Spotlight>,
    );
    const s = screen.getByTestId('s');
    expect(screen.getByRole('link', { name: 'entrar' })).toBeTruthy();
    moverMouse(s, 40, 30);
    expect(s.dataset.spot).toBe('activo');
    expect(s.style.getPropertyValue('--kz-spot-x')).toBe('40px');
    fireEvent.pointerLeave(s);
    expect(s.dataset.spot).toBe('reposo');
  });

  it('con reduced-motion queda en reposo y no sigue', () => {
    simularMedios({ reducido: true });
    render(<Spotlight data-testid="s" />);
    const s = screen.getByTestId('s');
    moverMouse(s, 40, 30);
    expect(s.dataset.spot).toBe('reposo');
    expect(s.style.getPropertyValue('--kz-spot-x')).toBe('50%');
  });

  it('sin hover (táctil) no sigue', () => {
    simularMedios({ hover: false });
    render(<Spotlight data-testid="s" reposo={null} />);
    const s = screen.getByTestId('s');
    moverMouse(s, 40, 30);
    expect(s.dataset.spot).toBe('apagado');
  });
});

describe('Card3D', () => {
  it('se inclina con el mouse y vuelve al salir', () => {
    render(
      <Card3D data-testid="c" brillo>
        <button type="button">ver</button>
      </Card3D>,
    );
    const escena = screen.getByTestId('c');
    const cuerpo = escena.firstElementChild as HTMLElement;
    escena.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    moverMouse(escena, 100, 50);
    expect(cuerpo.dataset.tilt).toBe('activo');
    expect(cuerpo.style.getPropertyValue('--kz-tilt-y')).toBe('8.00deg');
    expect(cuerpo.querySelector('[data-brillo]')?.getAttribute('aria-hidden')).toBe('true');
    fireEvent.pointerLeave(escena);
    expect(cuerpo.style.getPropertyValue('--kz-tilt-y')).toBe('0deg');
  });

  it('con reduced-motion queda plana y sin brillo', () => {
    simularMedios({ reducido: true });
    render(<Card3D data-testid="c" brillo />);
    const escena = screen.getByTestId('c');
    const cuerpo = escena.firstElementChild as HTMLElement;
    moverMouse(escena, 100, 50);
    expect(cuerpo.dataset.tilt).toBeUndefined();
    expect(cuerpo.querySelector('[data-brillo]')).toBeNull();
  });

  it('no agrega paradas de foco: el tab va directo al contenido', async () => {
    render(
      <>
        <button type="button">antes</button>
        <Card3D>
          <button type="button">adentro</button>
        </Card3D>
        <Spotlight>
          <button type="button">después</button>
        </Spotlight>
      </>,
    );
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(document.activeElement?.textContent).toBe('adentro');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('después');
  });
});

describe('fondos', () => {
  it('StarField es determinístico por semilla y decorativo', () => {
    expect(generarEstrellas(50, 2, 7)).toEqual(generarEstrellas(50, 2, 7));
    expect(generarEstrellas(50, 2, 7)).not.toEqual(generarEstrellas(50, 2, 8));
    const { container } = render(<StarField cantidad={40} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('circle')).toHaveLength(40);
  });

  it('Beams dibuja guía y pulso por haz, decorativo', () => {
    const { container } = render(<Beams cantidad={4} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('[data-guia]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-pulso]')).toHaveLength(4);
  });

  it('se pausan con la pestaña oculta', () => {
    const { container } = render(<StarField cantidad={5} />);
    const svg = container.querySelector('svg')!;
    expect(svg.hasAttribute('data-pausa')).toBe(false);
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(svg.hasAttribute('data-pausa')).toBe(true);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
});

describe('HeroText', () => {
  it('el título accesible es el texto entero, una sola vez', () => {
    render(<HeroText texto="Aprendé poker en serio" por="letra" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Aprendé poker en serio' })).toBeTruthy();
  });

  it('anima por palabras con escalonado', () => {
    const { container } = render(<HeroText texto="uno dos tres" as="h2" />);
    const h = container.querySelector('h2')!;
    expect(h.dataset.estado).toBe('animando');
    expect(h.querySelectorAll('[data-u]')).toHaveLength(3);
  });

  it('con reduced-motion muestra el estado final, sin animación', () => {
    simularMedios({ reducido: true });
    const { container } = render(<HeroText texto="uno dos tres" />);
    expect(container.querySelector('h1')!.dataset.estado).toBeUndefined();
  });

  it('el escalonado total respeta el tope', () => {
    const { container } = render(<HeroText texto={'a '.repeat(101)} escalon={100} topeTotal={1000} />);
    expect(container.querySelector('h1')!.style.getPropertyValue('--kz-escalon')).toBe('10.0ms');
  });
});

describe('HeroText — gradiente', () => {
  it('sin gradiente no marca nada', () => {
    const { container } = render(<HeroText texto="uno dos" />);
    expect(container.querySelector('h1')!.hasAttribute('data-gradiente')).toBe(false);
  });

  it('con gradiente lo expone y mide cada pieza para que corra continuo', () => {
    const { container } = render(<HeroText texto="uno dos tres" gradiente="linear-gradient(90deg, red, blue)" />);
    const h = container.querySelector('h1')!;
    expect(h.hasAttribute('data-gradiente')).toBe(true);
    expect(h.style.getPropertyValue('--kz-hero-gradiente')).toBe('linear-gradient(90deg, red, blue)');
    expect(h.style.getPropertyValue('--kz-hero-w')).toMatch(/px$/);
    h.querySelectorAll<HTMLElement>('[data-u]').forEach((u) => {
      expect(u.style.getPropertyValue('--x')).toMatch(/px$/);
      expect(u.style.getPropertyValue('--y')).toMatch(/px$/);
    });
  });
});
