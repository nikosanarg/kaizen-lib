'use client';

import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';
import { crearAgendador, esPunteroFino, usePrefiereReducido, useTieneHover } from './entorno';

export type SpotlightProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Color del halo. Default `var(--kz-accent-soft)`. */
  color?: string;
  /** Radio del halo en px. Default 320. */
  radio?: number;
  /**
   * Dónde queda el halo cuando no sigue al puntero (táctil, reduced-motion,
   * puntero afuera), como `"x y"` en CSS. Default `"50% 0%"`, arriba al centro.
   * `null` lo apaga en esos casos.
   */
  reposo?: string | null;
};

const Raiz = styled.div<{ $color: string; $radio: number }>`
  position: relative;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
      ${(p) => p.$radio}px circle at var(--kz-spot-x, 50%) var(--kz-spot-y, 0%),
      ${(p) => p.$color},
      transparent 70%
    );
    opacity: 0;
    transition: opacity var(--kz-duration-enter, 220ms) var(--kz-ease-enter, ease-out);
  }

  &[data-spot='reposo']::before,
  &[data-spot='activo']::before {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      transition: none;
    }
  }
`;

/**
 * Halo radial que sigue al puntero sobre una sección o card. No re-renderiza:
 * escribe `--kz-spot-x/y` a lo sumo una vez por frame y sólo mientras el
 * puntero se mueve encima. En táctil o con reduced-motion queda quieto en
 * `reposo`. El halo es un pseudo-elemento detrás del contenido: no tapa
 * clics ni foco.
 */
export function Spotlight({
  children,
  color = 'var(--kz-accent-soft)',
  radio = 320,
  reposo = '50% 0%',
  ...resto
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hover = useTieneHover();
  const reducido = usePrefiereReducido();
  const sigue = hover && !reducido;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [rx = '50%', ry = '0%'] = (reposo ?? '').split(/\s+/).filter(Boolean);
    const quieto = () => {
      el.style.setProperty('--kz-spot-x', rx);
      el.style.setProperty('--kz-spot-y', ry);
      el.dataset.spot = reposo === null ? 'apagado' : 'reposo';
    };
    quieto();
    if (!sigue) return;

    let x = 0;
    let y = 0;
    const ag = crearAgendador(() => {
      el.style.setProperty('--kz-spot-x', `${x}px`);
      el.style.setProperty('--kz-spot-y', `${y}px`);
      el.dataset.spot = 'activo';
    });
    const mover = (e: PointerEvent) => {
      if (!esPunteroFino(e)) return;
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      ag.pedir();
    };
    const salir = () => {
      ag.cancelar();
      quieto();
    };
    el.addEventListener('pointermove', mover, { passive: true });
    el.addEventListener('pointerleave', salir);
    return () => {
      ag.cancelar();
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerleave', salir);
    };
  }, [sigue, reposo]);

  return (
    <Raiz ref={ref} $color={color} $radio={radio} {...resto}>
      {children}
    </Raiz>
  );
}
