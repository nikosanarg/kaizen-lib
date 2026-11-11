'use client';

import { AnimatePresence, LazyMotion, m } from 'motion/react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ToastProvider } from '../ui/Toast';
import type { ToastAnimacion, ToastProviderProps } from '../ui/Toast';
import { slideSide, slideUp } from './presets';

const Presence = ({ children }: { children?: ReactNode }) => (
  <AnimatePresence initial={false}>
    {children}
  </AnimatePresence>
);

/** `layout` necesita `domMax`: se carga en diferido y sólo acá, sin tocar `MotionProvider`. */
const cargarMax = () => import('motion/react').then((mod) => mod.domMax);
const Envoltura = ({ children }: { children?: ReactNode }) => (
  <LazyMotion features={cargarMax}>{children}</LazyMotion>
);

export type AnimatedToastProviderProps = Omit<ToastProviderProps, 'animacion'>;

/**
 * El mismo `ToastProvider` de `kaizen-lib/ui` (regiones aria-live, pausa,
 * teclado, `useToast`), con entrada y salida por preset y la pila reacomodada
 * con layout animation. Desde un costado en las posiciones `*-right`, desde
 * abajo en `bottom-center`. Requiere `MotionProvider` arriba.
 */
export function AnimatedToastProvider({ position = 'bottom-right', ...props }: AnimatedToastProviderProps) {
  const animacion = useMemo<ToastAnimacion>(
    () => ({
      Presence,
      Envoltura,
      item: { as: m.div, props: { layout: true, ...(position === 'bottom-center' ? slideUp() : slideSide('right')) } },
    }),
    [position],
  );
  return <ToastProvider {...props} position={position} animacion={animacion} />;
}
