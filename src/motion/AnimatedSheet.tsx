'use client';

import { AnimatePresence, m, useDragControls } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { fg, radius, space } from '../tokens';
import type { ModalAnimacion } from '../ui/Modal';
import { Sheet } from '../ui/Sheet';
import type { SheetProps } from '../ui/Sheet';
import { cierraPorArrastre } from './arrastre';
import { desdeBorde, fade } from './presets';

const Presence = ({ children }: { children?: ReactNode }) => <AnimatePresence>{children}</AnimatePresence>;

/* Zona de agarre generosa (el dedo), con la barrita visible al centro. */
const Agarre = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  padding: ${space[2]} 0 ${space[1]};
  cursor: grab;
  touch-action: none;

  &::before {
    content: '';
    width: 36px;
    height: 4px;
    border-radius: ${radius.pill};
    background: ${fg.muted};
    opacity: 0.5;
  }
`;

export type AnimatedSheetProps = Omit<SheetProps, 'animacion' | 'cabecera'> & {
  /** Cerrar arrastrando el tirador hacia abajo. Default `true`. */
  arrastrable?: boolean;
};

/**
 * `Sheet` que sube desde abajo y baja al cerrar, con un tirador que cierra
 * arrastrándolo hacia abajo (umbral en `cierraPorArrastre`). El arrastre
 * arranca sólo desde el tirador, para no pelear con el scroll del cuerpo, y
 * no cierra con `disableClose`. El tirador es decorativo para lectores de
 * pantalla: `Escape` y la X son el cierre accesible. Requiere `MotionProvider`.
 */
export function AnimatedSheet({ arrastrable = true, onClose, disableClose = false, ...props }: AnimatedSheetProps) {
  const controles = useDragControls();
  const cerrar = useRef(onClose);
  cerrar.current = onClose;
  const ocupado = useRef(disableClose);
  ocupado.current = disableClose;

  const animacion = useMemo<ModalAnimacion>(() => {
    const alSoltar = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const panel = (event.target as Element | null)?.closest?.('[role="dialog"]');
      const alto = panel?.getBoundingClientRect().height ?? 0;
      if (!ocupado.current && cierraPorArrastre(info.offset.y, info.velocity.y, alto)) cerrar.current();
    };
    return {
      Presence,
      overlay: { as: m.div, props: fade() },
      panel: {
        as: m.div,
        props: {
          ...desdeBorde('bottom'),
          ...(arrastrable
            ? {
                drag: 'y',
                dragControls: controles,
                dragListener: false,
                dragConstraints: { top: 0, bottom: 0 },
                dragElastic: { top: 0, bottom: 1 },
                onDragEnd: alSoltar,
              }
            : {}),
        },
      },
    };
  }, [arrastrable, controles]);

  const cabecera = arrastrable ? (
    <Agarre
      aria-hidden="true"
      data-kz-tirador=""
      onPointerDown={(event) => {
        if (!disableClose) controles.start(event);
      }}
    />
  ) : null;

  return <Sheet {...props} onClose={onClose} disableClose={disableClose} animacion={animacion} cabecera={cabecera} />;
}
