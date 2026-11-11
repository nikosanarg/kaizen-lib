'use client';

import { useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useActivo } from './entorno';

export type StarFieldProps = {
  /** Cantidad de estrellas. Default 300. */
  cantidad?: number;
  /** Radio máximo en px (el mínimo es 0.5). Default 1.5. */
  tamanoMax?: number;
  /** Color de las estrellas. Default `var(--kz-accent)`. */
  color?: string;
  /**
   * Centro de la nube en % (`[x, y]`) y dispersión. Default `[50, 62.5]` y 25:
   * la distribución de taboo y nsandev.
   */
  centro?: [number, number];
  dispersion?: number;
  /** Semilla: el mismo número da el mismo cielo en servidor y cliente. Default 1. */
  semilla?: number;
  /** `fijo` cubre la ventana detrás de todo (como en taboo y nsandev); `relleno` llena su contenedor posicionado. Default `relleno`. */
  modo?: 'fijo' | 'relleno';
  className?: string;
};

/** PRNG chico y determinístico (mulberry32). */
const azar = (semilla: number) => {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Estrella = { x: number; y: number; r: number; grupo: 0 | 1 | 2 | 3 };

export function generarEstrellas(
  cantidad: number,
  tamanoMax: number,
  semilla: number,
  [cx, cy]: [number, number] = [50, 62.5],
  dispersion = 25,
): Estrella[] {
  const rnd = azar(semilla);
  const gauss = (c: number) => {
    const u = rnd() || 1e-9;
    const v = rnd();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(0, Math.min(100, c + z * dispersion));
  };
  return Array.from({ length: cantidad }, () => {
    const r = 0.5 + rnd() * Math.max(0, tamanoMax - 0.5);
    const grupo = (r < 0.9 ? 0 : 1 + Math.floor(rnd() * 3)) as Estrella['grupo'];
    return { x: +gauss(cx).toFixed(2), y: +gauss(cy).toFixed(2), r: +r.toFixed(2), grupo };
  });
}

const titilar = keyframes`
  from { opacity: 0.25; }
  to { opacity: 1; }
`;

const Lienzo = styled.svg<{ $fijo: boolean; $color: string }>`
  position: ${(p) => (p.$fijo ? 'fixed' : 'absolute')};
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: ${(p) => (p.$fijo ? -1 : 0)};
  pointer-events: none;
  fill: ${(p) => p.$color};

  & > g {
    opacity: 0.6;
  }
  & > g[data-g='1'] {
    animation: ${titilar} 1.6s ease-in-out infinite alternate;
  }
  & > g[data-g='2'] {
    animation: ${titilar} 2.3s ease-in-out 0.4s infinite alternate;
  }
  & > g[data-g='3'] {
    animation: ${titilar} 3.1s ease-in-out 0.9s infinite alternate;
  }
  &[data-pausa] > g {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    & > g[data-g] {
      animation: none;
      opacity: 0.7;
    }
  }
`;

/**
 * Cielo de estrellas en un único SVG: unifica el `StarField` que estaba copiado
 * en taboo y nsandev. Las estrellas titilan en tres grupos (tres animaciones de
 * opacidad, no una por estrella) y se pausan fuera de pantalla o con la pestaña
 * oculta. Posiciones determinísticas por `semilla`: sin desajuste de hidratación
 * ni un render vacío antes de montar. Decorativo: `aria-hidden`.
 */
export function StarField({
  cantidad = 300,
  tamanoMax = 1.5,
  color = 'var(--kz-accent)',
  centro = [50, 62.5],
  dispersion = 25,
  semilla = 1,
  modo = 'relleno',
  className,
}: StarFieldProps) {
  const ref = useRef<SVGSVGElement>(null);
  const activo = useActivo(ref);
  const [cx, cy] = centro;
  const grupos = useMemo(() => {
    const g: Estrella[][] = [[], [], [], []];
    for (const e of generarEstrellas(cantidad, tamanoMax, semilla, [cx, cy], dispersion)) g[e.grupo]!.push(e);
    return g;
  }, [cantidad, tamanoMax, semilla, cx, cy, dispersion]);

  return (
    <Lienzo
      ref={ref}
      aria-hidden="true"
      focusable="false"
      className={className}
      $fijo={modo === 'fijo'}
      $color={color}
      data-pausa={activo ? undefined : ''}
    >
      {grupos.map((estrellas, i) => (
        <g key={i} data-g={i}>
          {estrellas.map((e, j) => (
            <circle key={j} cx={`${e.x}%`} cy={`${e.y}%`} r={e.r} />
          ))}
        </g>
      ))}
    </Lienzo>
  );
}
