'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Una vez, cerca de la raíz (en Next, dentro del layout cliente). Carga sólo
 * `domAnimation` (animaciones, gestos, salida) y respeta
 * `prefers-reduced-motion`: con la preferencia activa, `motion` saca los
 * transforms y deja la opacidad.
 *
 * `strict` obliga a usar `m.*` en vez de `motion.*`, que cargaría el bundle
 * entero por su cuenta.
 *
 * Layout animation (`layout`, `layoutId`) necesita `domMax`, más pesado. La
 * pieza que la use la carga en diferido, sin tocar este provider:
 *
 * ```tsx
 * const cargarMax = () => import('motion/react').then((mod) => mod.domMax);
 * <LazyMotion features={cargarMax}>…</LazyMotion>
 * ```
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
