'use client';

import type { ComponentPropsWithoutRef, ElementType, MouseEvent } from 'react';
import styled, { css } from 'styled-components';
import { accent, danger, fg, font, radius, surface } from '../tokens';
import { formaBase, type IconButtonSize } from './shell';

export type { IconButtonSize };

/** Tope del badge: "+9" ocupa lo mismo que un dígito y dice lo mismo. */
const BADGE_MAXIMO = 9;

type Propios = {
  /**
   * Nombre accesible. Obligatorio: un botón de sólo ícono sin rótulo no existe
   * para un lector de pantalla. También es el tooltip nativo, salvo que haya
   * `motivo`.
   *
   * Si hay `badge`, la cuenta va **dentro** del label ("Notificaciones, 3 sin
   * leer"): el número visual es decorativo (`aria-hidden`) y el idioma del
   * texto no es asunto de esta librería.
   */
  label: string;
  /** El ícono. La librería no trae íconos: cada producto usa los suyos. */
  children: React.ReactNode;
  size?: IconButtonSize;
  /** Encendido: filtro aplicado, panel abierto, sección actual. */
  active?: boolean;
  /**
   * Contador. `0`, `undefined` y negativos no dibujan nada: "0 avisos" no es
   * un aviso. Pasado el tope se muestra "+9".
   */
  badge?: number;
  /**
   * Motivo por el que está bloqueado. Marca `aria-disabled` en vez del
   * `disabled` nativo: un botón realmente deshabilitado no recibe mouse ni
   * foco, así que nunca podría mostrar el motivo — que es lo único que hay
   * para comunicar.
   */
  motivo?: string;
};

type Props<T extends ElementType> = Propios & {
  /** Renderiza otro elemento o componente (un `<Link>` de Next, un `<a>`). */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof Propios | 'as'>;

const Raiz = styled.button<{ $size: IconButtonSize; $active: boolean }>`
  ${({ $size }) => formaBase($size)}
  background: ${({ $active }) => ($active ? accent.soft : 'transparent')};
  color: ${({ $active }) => ($active ? accent.DEFAULT : fg.muted)};

  ${({ $active }) =>
    !$active &&
    css`
      &:hover:not([aria-disabled='true']) {
        background: ${surface.hover};
        color: ${fg.DEFAULT};
      }

      &:active:not([aria-disabled='true']) {
        background: ${surface.active};
      }
    `}
`;

const Contador = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: ${radius.pill};
  background: ${danger.DEFAULT};
  color: ${danger.fg};
  font-size: ${font.xs};
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  pointer-events: none;
`;

function textoDelBadge(badge: number | undefined): string | null {
  if (badge === undefined || !Number.isFinite(badge) || badge < 1) return null;
  return badge > BADGE_MAXIMO ? `+${BADGE_MAXIMO}` : String(Math.floor(badge));
}

/**
 * Botón redondo de sólo ícono: el de la derecha de una topbar (notificaciones,
 * usuario, idioma, tema).
 *
 * Sin `as` es un `<button type="button">`. Con `as` toma otro elemento y no le
 * pone `type`, que en un `<a>` sería un atributo inválido.
 */
export function IconButton<T extends ElementType = 'button'>({
  label,
  children,
  size = 'md',
  active = false,
  badge,
  motivo,
  as,
  onClick,
  ...rest
}: Props<T>) {
  const bloqueado = Boolean(motivo);
  const textoBadge = textoDelBadge(badge);
  const esBoton = as === undefined || as === 'button';

  return (
    <Raiz
      {...rest}
      as={as}
      type={esBoton ? 'button' : undefined}
      $size={size}
      $active={active}
      aria-label={label}
      aria-pressed={esBoton && active ? true : undefined}
      aria-current={!esBoton && active ? 'page' : undefined}
      aria-disabled={bloqueado || undefined}
      title={motivo ?? label}
      onClick={(evento: MouseEvent<HTMLElement>) => {
        if (bloqueado) {
          evento.preventDefault();
          return;
        }
        (onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(evento);
      }}
    >
      {children}
      {textoBadge ? <Contador aria-hidden="true">{textoBadge}</Contador> : null}
    </Raiz>
  );
}
