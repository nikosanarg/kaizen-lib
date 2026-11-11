'use client';

import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';
import { crearAgendador, esPunteroFino, usePrefiereReducido, useTieneHover } from './entorno';

export type Card3DProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Inclinación máxima en grados. Default 8. */
  max?: number;
  /** Reflejo claro que sigue al puntero. Default `false`. */
  brillo?: boolean;
  /** Perspectiva en px. Default 900. */
  perspectiva?: number;
};

const Escena = styled.div<{ $p: number }>`
  perspective: ${(p) => p.$p}px;
  border-radius: inherit;
`;

const Cuerpo = styled.div`
  position: relative;
  height: 100%;
  border-radius: inherit;
  transform: rotateX(var(--kz-tilt-x, 0deg)) rotateY(var(--kz-tilt-y, 0deg));
  transition: transform 400ms var(--kz-ease-exit, ease);

  &[data-tilt='activo'] {
    transition: transform 80ms linear;
    will-change: transform;
  }

  & > [data-brillo] {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
      circle at var(--kz-glare-x, 50%) var(--kz-glare-y, 50%),
      rgba(255, 255, 255, 0.18),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 300ms ease;
  }

  &[data-tilt='activo'] > [data-brillo] {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition: none;
  }
`;

/**
 * Card que se inclina hacia el puntero, con brillo opcional. Sin hover
 * (táctil) o con reduced-motion queda plana: sin listeners ni transform. El
 * contenido conserva su orden de tabulación; la card no agrega foco ni roles.
 */
export function Card3D({ children, max = 8, brillo = false, perspectiva = 900, ...resto }: Card3DProps) {
  const escena = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const hover = useTieneHover();
  const reducido = usePrefiereReducido();
  const activo = hover && !reducido;

  useEffect(() => {
    const e = escena.current;
    const c = cuerpo.current;
    if (!activo || !e || !c) return;
    let px = 0.5;
    let py = 0.5;
    const ag = crearAgendador(() => {
      c.dataset.tilt = 'activo';
      c.style.setProperty('--kz-tilt-x', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      c.style.setProperty('--kz-tilt-y', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      c.style.setProperty('--kz-glare-x', `${(px * 100).toFixed(1)}%`);
      c.style.setProperty('--kz-glare-y', `${(py * 100).toFixed(1)}%`);
    });
    const mover = (ev: PointerEvent) => {
      if (!esPunteroFino(ev)) return;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return;
      px = (ev.clientX - r.left) / r.width;
      py = (ev.clientY - r.top) / r.height;
      ag.pedir();
    };
    const salir = () => {
      ag.cancelar();
      delete c.dataset.tilt;
      c.style.setProperty('--kz-tilt-x', '0deg');
      c.style.setProperty('--kz-tilt-y', '0deg');
    };
    e.addEventListener('pointermove', mover, { passive: true });
    e.addEventListener('pointerleave', salir);
    return () => {
      e.removeEventListener('pointermove', mover);
      e.removeEventListener('pointerleave', salir);
      salir();
    };
  }, [activo, max]);

  return (
    <Escena ref={escena} $p={perspectiva} {...resto}>
      <Cuerpo ref={cuerpo}>
        {children}
        {brillo && activo ? <span data-brillo aria-hidden="true" /> : null}
      </Cuerpo>
    </Escena>
  );
}
