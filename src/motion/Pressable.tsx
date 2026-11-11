'use client';

import { m } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';

/**
 * Respuesta táctil sutil para botones y cards: se hunde al apretar
 * (`whileTap`) y crece apenas con el puntero encima (`whileHover`, que
 * `motion` ignora en touch). Reemplaza al keyframe `buttonPress` de
 * tuxon-front.
 *
 * Renderiza el elemento nativo (`button` por defecto, `a` o `div` con `as`):
 * el foco, el `:focus-visible` y el teclado son los del elemento, y `motion`
 * también dispara `whileTap` con Enter. Deshabilitado no reacciona. Con
 * `prefers-reduced-motion` (vía `MotionProvider`) no hay escala.
 *
 * ```tsx
 * <Pressable onClick={guardar}>Guardar</Pressable>
 * <Pressable as="a" href="/curso/1" hover={false}>…card…</Pressable>
 * ```
 */
export type PressableProps = Omit<HTMLMotionProps<'button'>, 'whileTap' | 'whileHover'> & {
  as?: 'button' | 'a' | 'div';
  /** Escala al apretar. Default 0.97. */
  tap?: number;
  /** Escala con el puntero encima; `false` la apaga. Default 1.02. */
  hover?: number | false;
  /** Sólo con `as="a"`. */
  href?: string;
};

const ELEMENTOS = { button: m.button, a: m.a, div: m.div } as const;

export const Pressable = forwardRef<HTMLElement, PressableProps>(function Pressable(
  { as = 'button', tap = 0.97, hover = 1.02, disabled, type, ...props },
  ref,
) {
  const Elemento = ELEMENTOS[as] as unknown as typeof m.button;
  const quieto = disabled === true;
  const nativo = as === 'button' ? { type: type ?? 'button', disabled } : { 'aria-disabled': quieto || undefined };
  return (
    <Elemento
      ref={ref as never}
      {...nativo}
      whileTap={quieto ? undefined : { scale: tap }}
      whileHover={quieto || hover === false ? undefined : { scale: hover }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    />
  );
});
