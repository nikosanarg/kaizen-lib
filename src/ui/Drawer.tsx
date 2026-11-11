'use client';

import { Modal } from './Modal';
import type { ModalProps } from './Modal';

export type DrawerLado = 'izquierda' | 'derecha';

export type DrawerProps = Omit<ModalProps, 'posicion'> & {
  /** Borde del que sale. Default `derecha`. */
  lado?: DrawerLado;
};

/**
 * Panel lateral a toda la altura: una ficha de detalle al lado de una lista,
 * filtros, navegación secundaria. Es el `Modal` con `posicion` en un costado,
 * así que hereda `role="dialog"`, `aria-modal`, foco atrapado y devuelto,
 * `Escape`, pila y `disableClose`. El ancho sale de `size`/`maxWidth` como en
 * el modal. Versión animada: `AnimatedDrawer` de `kaizen-lib/motion`.
 *
 * ```tsx
 * <Drawer open={abierto} onClose={cerrar} title="Planta 14" lado="derecha" size="md">
 *   <Ficha />
 * </Drawer>
 * ```
 */
export function Drawer({ lado = 'derecha', ...props }: DrawerProps) {
  return <Modal {...props} posicion={lado} />;
}
