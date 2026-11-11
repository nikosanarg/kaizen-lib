'use client';

import { AnimatePresence, m } from 'motion/react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import type { ModalAnimacion, ModalProps } from '../ui/Modal';
import { fade, scale, slideUp } from './presets';

const Presence = ({ children }: { children?: ReactNode }) => <AnimatePresence>{children}</AnimatePresence>;

export type AnimatedModalProps = Omit<ModalProps, 'animacion'> & {
  /** Cómo entra el panel. El fondo siempre hace fade. Default `scale`. */
  entrada?: 'scale' | 'slideUp';
};

/**
 * El mismo `Modal` de `kaizen-lib/ui` (foco, Escape, pila, `disableClose`),
 * con fondo en fade y panel en scale o slide. La salida se ve: el modal se
 * desmonta cuando termina la animación. Requiere `MotionProvider` arriba.
 */
export function AnimatedModal({ entrada = 'scale', ...props }: AnimatedModalProps) {
  const animacion = useMemo<ModalAnimacion>(
    () => ({
      Presence,
      overlay: { as: m.div, props: fade() },
      panel: { as: m.div, props: entrada === 'slideUp' ? slideUp() : scale() },
    }),
    [entrada],
  );
  return <Modal {...props} animacion={animacion} />;
}
