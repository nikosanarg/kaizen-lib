'use client';

import type { CSSProperties, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { radius, space, surface } from '../tokens';

/**
 * El lugar de un dato que todavía no llegó. Unifica los esqueletos de
 * valle-verde (latido de opacidad), mixbol-front y kaizen-next (brillo que
 * recorre la barra). Queda el latido: sólo opacidad, barato de repintar en
 * una tabla entera, y con `prefers-reduced-motion` la barra queda quieta.
 *
 * La raíz es la que anuncia la carga (`role="status"`, `aria-busy`, y un
 * `label` sólo para lectores); las barras son `aria-hidden`. Copiá la
 * estructura de lo que reemplaza (mismas columnas, alturas parecidas) para
 * que nada se mueva cuando llegan los datos.
 *
 * ```tsx
 * <Skeleton variant="circle" width="40px" />
 * <Skeleton variant="line" lines={3} />
 * <Skeleton variant="block" height="120px" />
 * ```
 */
export type SkeletonVariant = 'block' | 'line' | 'circle';

export type SkeletonProps = {
  /** `line` (default): renglón de texto. `block`: card o imagen. `circle`: avatar. */
  variant?: SkeletonVariant;
  /** Ancho CSS. Default: todo el ancho (`circle`: 40px). */
  width?: string;
  /** Alto CSS. Default: `line` 0.9em, `block` 48px, `circle` igual al ancho. */
  height?: string;
  /** Sólo `line`: cuántos renglones. El último sale más corto, como un párrafo. */
  lines?: number;
  /** Lo que lee el lector de pantalla. Default "Cargando". */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const latir = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const Raiz = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${space[2]};
  width: 100%;
`;

const Barra = styled.span<{ $variant: SkeletonVariant; $w: string; $h: string }>`
  display: block;
  flex-shrink: 0;
  width: ${({ $w }) => $w};
  max-width: 100%;
  height: ${({ $h }) => $h};
  border-radius: ${({ $variant }) => ($variant === 'circle' ? '50%' : $variant === 'block' ? radius.md : radius.sm)};
  background: ${surface.hover};
  animation: ${latir} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SoloLector = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export function Skeleton({
  variant = 'line',
  width,
  height,
  lines = 1,
  label = 'Cargando',
  className,
  style,
}: SkeletonProps) {
  const w = width ?? (variant === 'circle' ? '40px' : '100%');
  const h = height ?? (variant === 'circle' ? w : variant === 'block' ? '48px' : '0.9em');
  const cuantas = variant === 'line' ? Math.max(1, Math.floor(lines)) : 1;
  const barras: ReactNode[] = [];
  for (let i = 0; i < cuantas; i++) {
    const ultima = cuantas > 1 && i === cuantas - 1;
    barras.push(
      <Barra key={i} aria-hidden="true" data-skeleton="" $variant={variant} $w={ultima ? '60%' : w} $h={h} />,
    );
  }
  return (
    <Raiz role="status" aria-busy="true" aria-live="polite" className={className} style={style}>
      {barras}
      <SoloLector>{label}</SoloLector>
    </Raiz>
  );
}
