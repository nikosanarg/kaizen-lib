'use client';

import type { ReactElement, ReactNode } from 'react';
import { Menu as Base } from '@base-ui/react/menu';
import styled from 'styled-components';
import { filaFlotante, focoVisible, listaFlotante, posicionador, superficieFlotante } from './flotante';
import type { FlotanteAlign, FlotanteSide } from './Tooltip';
import { danger, fg, motion, radius, surface } from '../tokens';

export type MenuItem = {
  label: string;
  onSelect: () => void;
  /** Ícono decorativo a la izquierda (con `aria-hidden`). */
  icon?: ReactNode;
  /** Acción destructiva: se pinta con el tono `danger`. */
  danger?: boolean;
  disabled?: boolean;
};

export type MenuProps = {
  items: MenuItem[];
  /**
   * Disparador propio. Sin él se dibuja un botón redondo de "más acciones"
   * (tres puntos verticales) nombrado con `label`.
   */
  trigger?: ReactElement;
  /** Nombre accesible del botón por defecto. */
  label?: string;
  side?: FlotanteSide;
  align?: FlotanteAlign;
};

const Posicionador = styled(Base.Positioner)`
  ${posicionador}
`;

const Panel = styled(Base.Popup)`
  ${superficieFlotante}
  ${listaFlotante}
  min-width: 180px;
`;

const Fila = styled(Base.Item)<{ $danger: boolean }>`
  ${filaFlotante}
  color: ${({ $danger }) => ($danger ? danger.DEFAULT : fg.DEFAULT)};

  & > svg {
    flex-shrink: 0;
  }
`;

const BotonPuntos = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: ${radius.circle};
  background: transparent;
  color: ${fg.muted};
  cursor: pointer;
  transition: background ${motion.fast} ${motion.ease};

  &:hover,
  &[data-popup-open] {
    background: ${surface.hover};
  }

  ${focoVisible}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Puntos = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

/**
 * Menú desplegable de acciones. Parte de `ui/Menu` de mixbol-front (lista de
 * `items` con `onSelect`, ícono y `danger`, y el botón de tres puntos por
 * defecto). Flechas, Home/End, typeahead, Enter, Esc y foco de vuelta al
 * disparador los resuelve Base UI.
 *
 * ```tsx
 * <Menu
 *   label="Acciones del trago"
 *   items={[
 *     { label: 'Editar', onSelect: editar },
 *     { label: 'Borrar', onSelect: borrar, danger: true },
 *   ]}
 * />
 * ```
 */
export function Menu({ items, trigger, label = 'Más acciones', side = 'bottom', align = 'end' }: MenuProps) {
  return (
    <Base.Root>
      <Base.Trigger
        render={
          trigger ?? (
            <BotonPuntos type="button" aria-label={label}>
              <Puntos />
            </BotonPuntos>
          )
        }
      />
      <Base.Portal>
        <Posicionador side={side} align={align} sideOffset={6} collisionPadding={8}>
          <Panel>
            {items.map((item) => (
              <Fila key={item.label} $danger={!!item.danger} disabled={item.disabled} onClick={item.onSelect}>
                {item.icon}
                {item.label}
              </Fila>
            ))}
          </Panel>
        </Posicionador>
      </Base.Portal>
    </Base.Root>
  );
}
