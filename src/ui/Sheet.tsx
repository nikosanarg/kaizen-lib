'use client';

import styled from 'styled-components';
import { space } from '../tokens';
import { Modal } from './Modal';
import type { ModalProps } from './Modal';

/**
 * Alturas fijas del sheet. `auto` crece con el contenido hasta casi toda la
 * pantalla; `media` y `completa` son fijas (útil cuando el contenido carga
 * por partes y no querés que el panel salte). Un string es un alto CSS literal.
 */
export type SheetAltura = 'auto' | 'media' | 'completa' | (string & {});

const ALTOS: Record<string, string> = {
  media: '50dvh',
  completa: `calc(100dvh - ${space[6]})`,
};

export type SheetProps = Omit<ModalProps, 'posicion'> & {
  /** Default `auto`. Ver `SheetAltura`. */
  altura?: SheetAltura;
};

/* La clase cae en el panel del Modal; `&&` gana sobre su `max-height`. */
const ModalAbajo = styled(Modal)<{ $alto?: string }>`
  && {
    ${({ $alto }) => ($alto ? `height: ${$alto}; max-height: calc(100dvh - ${space[6]});` : '')}
  }
`;

/**
 * Panel que sube desde el borde inferior, pensado para el teléfono: listas
 * para elegir, formularios cortos, acciones. Es el `Modal` con
 * `posicion="abajo"`, así que foco, `Escape`, pila y `disableClose` son los
 * suyos. Sin animación: la versión animada, con cierre por arrastre, es
 * `AnimatedSheet` de `kaizen-lib/motion`.
 *
 * ```tsx
 * <Sheet open={abierto} onClose={cerrar} title="Elegir cancha" altura="media">
 *   <ListaDeCanchas />
 * </Sheet>
 * ```
 */
export function Sheet({ altura = 'auto', maxWidth = '640px', ...props }: SheetProps) {
  const alto = altura === 'auto' ? undefined : (ALTOS[altura] ?? altura);
  return <ModalAbajo {...props} maxWidth={maxWidth} posicion="abajo" $alto={alto} />;
}
