'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ElementType } from 'react';
import styled, { keyframes } from 'styled-components';
import { useVisto } from './entorno';

export type HeroTextProps = {
  /** El texto. Sólo string: se parte en palabras o letras. */
  texto: string;
  /** Unidad que aparece de a una. Default `palabra`. */
  por?: 'palabra' | 'letra';
  /** Elemento que lo envuelve (`h1`, `h2`, `p`…). Default `h1`. */
  as?: ElementType;
  /** Milisegundos entre una unidad y la siguiente. Default 60 por palabra, 25 por letra. */
  escalon?: number;
  /** Tope del escalonado total, en ms: textos largos no tardan de más. Default 1200. */
  topeTotal?: number;
  className?: string;
  id?: string;
};

const useLayoutIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const aparecer = keyframes`
  from { opacity: 0; transform: translateY(0.35em); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: none; }
`;

const Raiz = styled.h1`
  & [data-u] {
    display: inline-block;
    white-space: pre;
  }
  & [data-p] {
    display: inline-block;
    white-space: nowrap;
  }
  &[data-estado='espera'] [data-u] {
    opacity: 0;
  }
  &[data-estado='animando'] [data-u] {
    animation: ${aparecer} 520ms var(--kz-ease-enter, ease-out) both;
    animation-delay: calc(var(--i) * var(--kz-escalon));
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-estado] [data-u] {
      animation: none;
      opacity: 1;
    }
  }
`;

const oculto: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

/**
 * Título que aparece por palabras o letras, escalonado, la primera vez que
 * entra en pantalla. El lector de pantalla lee el texto entero una sola vez
 * (las piezas animadas van `aria-hidden`). El HTML del servidor trae el
 * texto visible: si el JS no llega o hay reduced-motion, se ve el estado final.
 * CSS puro: no necesita `motion` ni `MotionProvider`.
 */
export function HeroText({ texto, por = 'palabra', as = 'h1', escalon, topeTotal = 1200, className, id }: HeroTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [anima, setAnima] = useState(false);
  const visto = useVisto(ref);

  useLayoutIso(() => {
    const reducido =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducido) setAnima(true);
  }, []);

  const palabras = texto.split(/\s+/).filter(Boolean);
  const unidades = por === 'letra' ? palabras.reduce((n, p) => n + [...p].length, 0) : palabras.length;
  const base = escalon ?? (por === 'letra' ? 25 : 60);
  const paso = unidades > 1 ? Math.min(base, topeTotal / (unidades - 1)) : base;
  const estado = !anima ? undefined : visto ? 'animando' : 'espera';

  let i = 0;
  const pieza = (contenido: string, key: string) => (
    <span key={key} data-u="" style={{ '--i': i++ } as CSSProperties}>
      {contenido}
    </span>
  );

  return (
    <Raiz
      as={as}
      ref={ref}
      id={id}
      className={className}
      data-estado={estado}
      style={{ '--kz-escalon': `${paso.toFixed(1)}ms` } as CSSProperties}
    >
      <span style={oculto}>{texto}</span>
      <span aria-hidden="true">
        {palabras.map((p, k) => (
          <span key={k}>
            {por === 'letra' ? <span data-p="">{[...p].map((l, j) => pieza(l, `${k}-${j}`))}</span> : pieza(p, `${k}`)}
            {k < palabras.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Raiz>
  );
}
