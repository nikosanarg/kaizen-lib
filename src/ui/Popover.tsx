'use client';

import { useState, type ReactElement, type ReactNode } from 'react';
import { Popover as Base } from '@base-ui/react/popover';
import styled from 'styled-components';
import { posicionador, superficieFlotante } from './flotante';
import type { FlotanteAlign, FlotanteSide } from './Tooltip';
import { font, space } from '../tokens';

export type PopoverProps = {
  /** El botón que abre y cierra. Un elemento que acepte ref y props. */
  trigger: ReactElement;
  /** Contenido. Como función recibe `close` para cerrarlo desde adentro (ej. al aplicar un filtro). */
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Título visible; también nombra el panel para lectores de pantalla. */
  title?: ReactNode;
  /** Nombre accesible del panel cuando no hay `title`. */
  label?: string;
  side?: FlotanteSide;
  align?: FlotanteAlign;
  /** Ancho mínimo del panel (CSS). Por defecto, el del disparador. */
  minWidth?: string;
  /** Controlado: si se pasa, el estado vive afuera. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const Posicionador = styled(Base.Positioner)`
  ${posicionador}
`;

const Panel = styled(Base.Popup)<{ $minWidth: string }>`
  ${superficieFlotante}
  min-width: ${({ $minWidth }) => $minWidth};
  max-width: calc(100vw - 16px);
  max-height: var(--available-height);
  overflow: auto;
  padding: ${space[3]};
`;

const Titulo = styled(Base.Title)`
  margin: 0 0 ${space[2]};
  font-size: ${font.md};
  font-weight: 600;
`;

/**
 * Panel flotante no modal anclado a un disparador: filtros, detalles, un
 * formulario corto. Parte de `ui/Popover` de valle-verde (`trigger` +
 * contenido que recibe cómo cerrarse). El foco entra al abrir y vuelve al
 * disparador al cerrar; Esc y clic afuera cierran. Todo eso es de Base UI.
 *
 * ```tsx
 * <Popover trigger={<button>Filtros</button>} title="Filtrar">
 *   {({ close }) => <Filtros onAplicar={close} />}
 * </Popover>
 * ```
 */
export function Popover({
  trigger,
  children,
  title,
  label,
  side = 'bottom',
  align = 'start',
  minWidth = 'var(--anchor-width)',
  open,
  onOpenChange,
  className,
}: PopoverProps) {
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const abierto = open ?? abiertoInterno;
  const cambiar = (siguiente: boolean) => {
    if (open === undefined) setAbiertoInterno(siguiente);
    onOpenChange?.(siguiente);
  };
  const close = () => cambiar(false);

  return (
    <Base.Root open={abierto} onOpenChange={cambiar}>
      <Base.Trigger render={trigger} />
      <Base.Portal>
        <Posicionador side={side} align={align} sideOffset={6} collisionPadding={8}>
          <Panel className={className} $minWidth={minWidth} aria-label={title ? undefined : label}>
            {title ? <Titulo>{title}</Titulo> : null}
            {typeof children === 'function' ? children({ close }) : children}
          </Panel>
        </Posicionador>
      </Base.Portal>
    </Base.Root>
  );
}
