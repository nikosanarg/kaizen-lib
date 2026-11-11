'use client';

import { useId, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import { useActivo } from './entorno';

export type BeamsProps = {
  /** Cantidad de haces. Default 6. */
  cantidad?: number;
  /** Color del haz. Default `var(--kz-accent)`. */
  color?: string;
  /** Segundos que tarda un pulso en recorrer su haz. Default 7. */
  duracion?: number;
  className?: string;
};

const recorrer = keyframes`
  from { stroke-dashoffset: 120; }
  to { stroke-dashoffset: 0; }
`;

const Lienzo = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;

  & path {
    fill: none;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
  & [data-guia] {
    stroke-opacity: 0.12;
  }
  & [data-pulso] {
    stroke-width: 1.5;
    stroke-dasharray: 20 100;
    stroke-linecap: round;
    animation: ${recorrer} var(--kz-beam-dur) linear var(--kz-beam-delay) infinite;
  }
  &[data-pausa] [data-pulso] {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    & [data-pulso] {
      display: none;
    }
  }
`;

/**
 * Haces curvos de fondo con un pulso de luz que los recorre. SVG con
 * `stroke-dashoffset` animado en CSS (compositor, sin JS por frame), pausado
 * fuera de pantalla o con la pestaña oculta. Con reduced-motion quedan sólo
 * las guías quietas. Va dentro de un contenedor posicionado. Decorativo.
 */
export function Beams({ cantidad = 6, color = 'var(--kz-accent)', duracion = 7, className }: BeamsProps) {
  const ref = useRef<SVGSVGElement>(null);
  const activo = useActivo(ref);
  const id = useId().replace(/:/g, '');
  const caminos = useMemo(
    () =>
      Array.from({ length: cantidad }, (_, i) => {
        const t = cantidad > 1 ? i / (cantidad - 1) : 0.5;
        const x0 = -10 + t * 50;
        const x1 = 40 + t * 70;
        return `M${x0.toFixed(1)} -5 C ${(x0 + 10).toFixed(1)} 40, ${(x1 - 30).toFixed(1)} 60, ${x1.toFixed(1)} 105`;
      }),
    [cantidad],
  );

  return (
    <Lienzo
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      data-pausa={activo ? undefined : ''}
    >
      <defs>
        <linearGradient id={`kz-beam-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {caminos.map((d, i) => (
        <g key={i}>
          <path data-guia d={d} stroke={color} />
          <path
            data-pulso
            d={d}
            pathLength={100}
            stroke={`url(#kz-beam-${id})`}
            style={
              {
                '--kz-beam-dur': `${duracion + (i % 3)}s`,
                '--kz-beam-delay': `${-((i * 1.7) % duracion).toFixed(1)}s`,
              } as CSSProperties
            }
          />
        </g>
      ))}
    </Lienzo>
  );
}
