'use client';

import { useMotionValueEvent, useSpring } from 'motion/react';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

/**
 * Una cantidad que cuenta hasta su valor con un spring (un total, un saldo,
 * un indicador). Reemplaza al `NumeroAnimado` de valle-verde, que contaba con
 * `requestAnimationFrame` a mano.
 *
 * - Cuenta desde `desde` (default 0) al montar y, cuando `value` cambia,
 *   sigue desde lo que se ve. El texto se escribe directo en el DOM: no hay
 *   un render de React por cuadro.
 * - Con `prefers-reduced-motion` salta directo al valor.
 * - El lector de pantalla lee sólo el valor final: los pasos van en un span
 *   `aria-hidden` y el final en uno sólo para lectores.
 * - `value` `null`/`undefined` = todavía no hay dato: se muestra `sinDato`,
 *   nunca un 0 provisional.
 *
 * ```tsx
 * <AnimatedNumber value={saldo} formato={{ style: 'currency', currency: 'ARS' }} />
 * ```
 */
export type AnimatedNumberProps = {
  value: number | null | undefined;
  /** Opciones de `Intl.NumberFormat`. Default: entero con separador de miles. */
  formato?: Intl.NumberFormatOptions;
  /** Locale de `Intl.NumberFormat`. Default `es-AR`. */
  locale?: string;
  /** Desde dónde cuenta al montar. Default 0. */
  desde?: number;
  /** Rigidez y amortiguación del spring. Default `{ stiffness: 90, damping: 20 }`. */
  spring?: { stiffness?: number; damping?: number; mass?: number };
  /** Qué se muestra sin dato. Default una raya. */
  sinDato?: ReactNode;
  className?: string;
};

const Cifra = styled.span`
  position: relative;
  font-variant-numeric: tabular-nums;
`;

const SoloLector = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

/**
 * El paso que se escribe mientras cuenta: si el destino es entero, los pasos
 * también (un conteo de personas no pasa por 312,457).
 */
export const pasoVisible = (n: number, destino: number): number =>
  Number.isInteger(destino) ? Math.round(n) : n;

const CONSULTA = '(prefers-reduced-motion: reduce)';
const suscribir = (aviso: () => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener?.('change', aviso);
  return () => mq.removeEventListener?.('change', aviso);
};
/** Se lee en vivo (no el valor que `motion` cachea al cargar). En SSR, sin animar. */
const leerReducido = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(CONSULTA).matches;

export function AnimatedNumber({
  value,
  formato,
  locale = 'es-AR',
  desde = 0,
  spring,
  sinDato = '—',
  className,
}: AnimatedNumberProps) {
  const hayDato = typeof value === 'number' && Number.isFinite(value);
  const reducido = useSyncExternalStore(suscribir, leerReducido, () => false);
  const claveFormato = JSON.stringify(formato ?? null);
  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, formato ?? { maximumFractionDigits: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, claveFormato],
  );
  const mv = useSpring(reducido && hayDato ? value : desde, { stiffness: 90, damping: 20, ...spring });
  const visible = useRef<HTMLSpanElement>(null);
  const destino = useRef(hayDato ? value : desde);

  useMotionValueEvent(mv, 'change', (n) => {
    if (visible.current) visible.current.textContent = fmt.format(pasoVisible(n, destino.current));
  });

  useEffect(() => {
    if (!hayDato) return;
    destino.current = value;
    if (reducido) mv.jump(value);
    else mv.set(value);
  }, [hayDato, value, reducido, mv]);

  if (!hayDato) return <Cifra className={className}>{sinDato}</Cifra>;

  return (
    <Cifra className={className}>
      <span aria-hidden="true" ref={visible}>
        {fmt.format(pasoVisible(mv.get(), value))}
      </span>
      <SoloLector>{fmt.format(value)}</SoloLector>
    </Cifra>
  );
}
