'use client';

import { m } from 'motion/react';
import { Children } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { presets } from './presets';
import type { Preset } from './presets';

/**
 * Aparece al entrar en pantalla, una sola vez. Reemplaza los
 * `IntersectionObserver` a mano (FAQ de valle-verde, FloatingCTA de
 * tutipoker). Requiere `MotionProvider`: con `prefers-reduced-motion` queda
 * sólo el fade.
 *
 * Con `escalonado` (segundos), cada hijo directo entra con ese desfase:
 *
 * ```tsx
 * <Reveal preset="slideUp" escalonado={0.06}>
 *   {preguntas.map((p) => <Pregunta key={p.id} {...p} />)}
 * </Reveal>
 * ```
 */
export type RevealProps = {
  children: ReactNode;
  /** Nombre de un preset (`slideSide` entra por la derecha) o uno propio. Default `slideUp`. */
  preset?: keyof typeof presets | Preset;
  /** Segundos entre hijo e hijo. Sin él, el bloque entra entero. */
  escalonado?: number;
  /** Qué fracción tiene que verse para disparar (0 a 1). Default 0.2. */
  amount?: number;
  /** Margen del viewport, como `rootMargin` (p. ej. `'0px 0px -10% 0px'`). */
  margin?: string;
  className?: string;
  style?: CSSProperties;
};

const resolver = (p: RevealProps['preset']): Preset => (typeof p === 'object' ? p : presets[p ?? 'slideUp']());

export function Reveal({ children, preset, escalonado, amount = 0.2, margin, className, style }: RevealProps) {
  const p = resolver(preset);
  const viewport = { once: true, amount, ...(margin ? { margin } : {}) };

  if (escalonado === undefined) {
    return (
      <m.div className={className} style={style} initial={p.initial} whileInView={p.animate} viewport={viewport}>
        {children}
      </m.div>
    );
  }

  const variantes = { oculto: p.initial, visible: p.animate };
  return (
    <m.div
      className={className}
      style={style}
      initial="oculto"
      whileInView="visible"
      viewport={viewport}
      variants={{ oculto: {}, visible: { transition: { staggerChildren: escalonado } } }}
    >
      {Children.map(children, (hijo) => (
        <m.div variants={variantes}>{hijo}</m.div>
      ))}
    </m.div>
  );
}
