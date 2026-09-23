'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { fg, font, radius, ring, scrim, shadow, space, surface } from '../tokens';

/** Anchos del panel. `maxWidth` los pisa cuando un modal necesita otra medida. */
const ANCHOS = {
  sm: '420px',
  md: '560px',
  lg: '760px',
  xl: '980px',
} as const;

export type ModalSize = keyof typeof ANCHOS;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * El contenido de un modal suele ser condicional (pasos, listas que cargan por
 * fetch), así que se recalcula en cada Tab en vez de cachearse al montar — con
 * eso cacheado el trap queda desincronizado apenas cambia el cuerpo.
 */
const focusablesDe = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true',
  );

/**
 * Pila de modales abiertos. Hace falta por el anidamiento real (un modal de
 * confirmación abierto encima de un formulario): sólo el de más arriba
 * atiende `Escape`, y el scroll del fondo se libera cuando se cierra el
 * último, no el primero que se desmonte.
 */
const pila: string[] = [];
let overflowPrevio: string | null = null;

const bloquearScroll = () => {
  if (pila.length === 1 && typeof document !== 'undefined') {
    overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
};

const liberarScroll = () => {
  if (pila.length === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = overflowPrevio ?? '';
    overflowPrevio = null;
  }
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${space[4]};
  background: ${scrim};
`;

const Panel = styled.div<{ $maxWidth: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
  max-height: 90vh;
  background: ${surface[3]};
  color: ${fg.DEFAULT};
  /* Portalea a document.body, fuera de cualquier contenedor con su propia
     tipografía — sin esto hereda la fuente del body, no la del producto. */
  font-family: ${font.family};
  border-radius: ${radius.lg};
  box-shadow: ${shadow.xl};
  outline: none;
`;

const Header = styled.header<{ $conCierre: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: ${space[6]} ${space[6]} ${space[4]};
  ${({ $conCierre }) => $conCierre && css`padding-right: ${space[10]};`}
`;

const Titulos = styled.div`
  min-width: 0;
`;

const Titulo = styled.h2`
  margin: 0;
  font-size: ${font.lg};
  font-weight: 600;
  line-height: 1.3;
  color: ${fg.DEFAULT};
`;

const Descripcion = styled.p`
  margin: ${space[1]} 0 0;
  font-size: ${font.sm};
  color: ${fg.muted};
`;

const Body = styled.div<{ $flush: boolean }>`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ $flush }) => ($flush ? space[6] : `0 ${space[6]} ${space[2]}`)};
`;

const Footer = styled.footer`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${space[3]};
  padding: ${space[4]} ${space[6]} ${space[6]};
`;

const Cerrar = styled.button`
  position: absolute;
  top: ${space[3]};
  right: ${space[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${radius.sm};
  background: none;
  color: ${fg.muted};
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${surface.hover};
    color: ${fg.DEFAULT};
  }

  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

type Props = {
  open: boolean;
  onClose: () => void;
  /** Título visible, y nombre accesible cuando no se pasa `ariaLabel`. */
  title?: ReactNode;
  /** Subtítulo del encabezado. Sin `title` no se dibuja: es su acompañante. */
  description?: ReactNode;
  children: ReactNode;
  /** Zona de acciones al pie. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Ancho máximo explícito (pisa `size`). */
  maxWidth?: string;
  /** Botón de cierre en la esquina. Default `true`. */
  showClose?: boolean;
  /** Click afuera del panel cierra. Default `true`. */
  dismissOnOverlay?: boolean;
  /** Operación en curso: ni la X, ni el overlay, ni Escape cierran. */
  disableClose?: boolean;
  /** Nombre accesible cuando no hay `title` visible. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Shell único de modal: portal a `document.body`, foco atrapado y devuelto,
 * cierre por `Escape`/overlay/X, scroll de fondo bloqueado, pila para
 * anidamiento real (un modal de confirmación sobre un formulario abierto).
 *
 * No escribas un overlay propio: si falta una variante, se agrega acá.
 *
 * ```tsx
 * <Modal open={abierto} onClose={cerrar} title="Eliminar cepa" footer={<Acciones />}>
 *   <p>Esta acción no se puede deshacer.</p>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  maxWidth,
  showClose = true,
  dismissOnOverlay = true,
  disableClose = false,
  ariaLabel,
  className,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const devolverFocoA = useRef<HTMLElement | null>(null);
  const empezoEnOverlay = useRef(false);
  const [mounted, setMounted] = useState(false);
  const id = useId();
  const tituloId = `${id}-titulo`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    devolverFocoA.current = document.activeElement as HTMLElement | null;
    pila.push(id);
    bloquearScroll();

    return () => {
      const i = pila.lastIndexOf(id);
      if (i >= 0) pila.splice(i, 1);
      liberarScroll();
      devolverFocoA.current?.focus?.();
    };
  }, [open, id]);

  useEffect(() => {
    if (!open || !mounted) return;
    const panel = panelRef.current;
    if (!panel) return;
    const [primero] = focusablesDe(panel);
    (primero ?? panel).focus?.();
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return undefined;
    const alTeclear = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pila[pila.length - 1] !== id) return;
      if (disableClose) return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', alTeclear, true);
    return () => document.removeEventListener('keydown', alTeclear, true);
  }, [open, id, disableClose, onClose]);

  const manejarTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = focusablesDe(panel);
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const primero = focusables[0] as HTMLElement;
    const ultimo = focusables[focusables.length - 1] as HTMLElement;
    const activo = document.activeElement;

    if (event.shiftKey && (activo === primero || activo === panel || !panel.contains(activo))) {
      event.preventDefault();
      ultimo.focus();
      return;
    }
    if (!event.shiftKey && (activo === ultimo || !panel.contains(activo))) {
      event.preventDefault();
      primero.focus();
    }
  };

  /**
   * Un click cuyo mousedown ocurrió dentro del panel (seleccionar texto y
   * soltar afuera) burbujea igual hasta el overlay. Sólo cierra si el gesto
   * *empezó* en el overlay.
   */
  const manejarClickOverlay = (event: ReactMouseEvent<HTMLDivElement>) => {
    const empezoAfuera = empezoEnOverlay.current;
    empezoEnOverlay.current = false;
    if (!empezoAfuera || event.target !== event.currentTarget) return;
    if (dismissOnOverlay && !disableClose) onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <Overlay
      onMouseDown={(event) => {
        empezoEnOverlay.current = event.target === event.currentTarget;
      }}
      onClick={manejarClickOverlay}
    >
      <Panel
        ref={panelRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? tituloId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        $maxWidth={maxWidth ?? ANCHOS[size]}
        onKeyDown={manejarTab}
      >
        {showClose ? (
          <Cerrar type="button" onClick={onClose} disabled={disableClose} aria-label="Cerrar">
            ×
          </Cerrar>
        ) : null}

        {title ? (
          <Header $conCierre={showClose}>
            <Titulos>
              <Titulo id={tituloId}>{title}</Titulo>
              {description ? <Descripcion>{description}</Descripcion> : null}
            </Titulos>
          </Header>
        ) : null}

        <Body $flush={!title}>{children}</Body>

        {footer ? <Footer>{footer}</Footer> : null}
      </Panel>
    </Overlay>,
    document.body,
  );
}
