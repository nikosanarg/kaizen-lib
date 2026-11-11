'use client';

import { AnimatePresence, m } from 'motion/react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Drawer } from '../ui/Drawer';
import type { DrawerProps } from '../ui/Drawer';
import type { ModalAnimacion } from '../ui/Modal';
import { desdeBorde, fade } from './presets';

const Presence = ({ children }: { children?: ReactNode }) => <AnimatePresence>{children}</AnimatePresence>;

export type AnimatedDrawerProps = Omit<DrawerProps, 'animacion'>;

/**
 * `Drawer` que entra y sale por su costado, con el fondo en fade. Foco,
 * `Escape`, pila y `disableClose` son los del `Modal`. Requiere
 * `MotionProvider`.
 */
export function AnimatedDrawer({ lado = 'derecha', ...props }: AnimatedDrawerProps) {
  const animacion = useMemo<ModalAnimacion>(
    () => ({
      Presence,
      overlay: { as: m.div, props: fade() },
      panel: { as: m.div, props: desdeBorde(lado === 'izquierda' ? 'left' : 'right') },
    }),
    [lado],
  );
  return <Drawer {...props} lado={lado} animacion={animacion} />;
}
