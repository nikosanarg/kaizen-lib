'use client';

import type { ReactElement, ReactNode } from 'react';
import { Tooltip as Base } from '@base-ui/react/tooltip';
import styled from 'styled-components';
import { posicionador, superficieFlotante } from './flotante';
import { space } from '../tokens';

export type FlotanteSide = 'top' | 'bottom' | 'left' | 'right';
export type FlotanteAlign = 'start' | 'center' | 'end';

export type TooltipProps = {
  /** Lo que muestra el globo. Texto corto, o varias filas si hace falta. */
  content: ReactNode;
  /**
   * El disparador: UN elemento que acepte ref y props (un `button`, un
   * `IconButton`…). Tiene que tener su propio nombre accesible: el tooltip es
   * una ayuda visual y un lector de pantalla no lo anuncia.
   */
  children: ReactElement;
  side?: FlotanteSide;
  align?: FlotanteAlign;
  /** Espera antes de abrir con el puntero, en ms. El foco de teclado abre al instante. */
  delay?: number;
  /** Apaga el tooltip sin desmontar el disparador. */
  disabled?: boolean;
  className?: string;
};

const Posicionador = styled(Base.Positioner)`
  ${posicionador}
`;

const Globo = styled(Base.Popup)`
  ${superficieFlotante}
  max-width: min(320px, calc(100vw - 16px));
  padding: ${space[2]} ${space[3]};
  line-height: 1.4;
`;

/**
 * Ayuda visual al pasar el puntero o enfocar con teclado. Reemplaza los
 * tooltips a mano de valle-verde y taboo-next: el posicionamiento (con
 * volteo en los bordes), el portal y el cierre con Esc los resuelve Base UI.
 *
 * ```tsx
 * <Tooltip content="Copiar enlace">
 *   <IconButton aria-label="Copiar enlace">…</IconButton>
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children, side = 'top', align = 'center', delay = 300, disabled, className }: TooltipProps) {
  return (
    <Base.Root disabled={disabled}>
      <Base.Trigger delay={delay} render={children} />
      <Base.Portal>
        <Posicionador side={side} align={align} sideOffset={8} collisionPadding={8}>
          <Globo className={className}>{content}</Globo>
        </Posicionador>
      </Base.Portal>
    </Base.Root>
  );
}
