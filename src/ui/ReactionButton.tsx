'use client';

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';
import { accent, danger, fg, font, info, motion, success, warning } from '../tokens';
import { formaBase, LADO_ICONO, type IconButtonSize } from './shell';

/**
 * El color que toma el ícono al reaccionar. Reusa los tonos semánticos que
 * la librería ya tiene — no hay `heart` ni `bookmark`: eso es marca de
 * producto, no una categoría que otro consumidor vaya a repetir. Un color
 * que ninguno de estos seis cubre se pisa con `style` (ver `label`, abajo
 * del componente, para el ejemplo).
 */
export type ReactionTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

const TONO_ENCENDIDO: Record<ReactionTone, string> = {
  neutral: fg.DEFAULT,
  accent: accent.DEFAULT,
  success: success.DEFAULT,
  danger: danger.DEFAULT,
  warning: warning.DEFAULT,
  info: info.DEFAULT,
};

type Props = {
  /**
   * Nombre accesible. Si hay `count`, la cifra va DENTRO del label ("Me
   * gusta, 24"): el número visible es decorativo (`aria-hidden`), mismo
   * criterio que el `badge` de `IconButton`.
   */
  label: string;
  children: ReactNode;
  tone?: ReactionTone;
  size?: IconButtonSize;
  /** Reaccionado o no. A diferencia de `IconButton`, no tiñe el fondo: sólo el ícono cambia de color. */
  active?: boolean;
  /**
   * Resplandor alrededor del ícono cuando está activo. Del color del tono
   * (`currentColor`), no uno propio — así no hace falta un token de glow por
   * tono, y un color pisado con `style` resplandece del mismo color.
   */
  glow?: boolean;
  /** Cuenta visible junto al ícono. `0` se muestra: "0 me gusta" es un dato, no una ausencia. */
  count?: number;
  motivo?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const Raiz = styled.button<{ $size: IconButtonSize; $tone: ReactionTone; $active: boolean; $glow: boolean }>`
  ${({ $size }) => formaBase($size)}
  gap: 4px;
  width: auto;
  min-width: ${({ $size }) => LADO_ICONO[$size]}px;
  padding: 0 8px;
  background: transparent;
  --kz-icon-on: ${({ $tone }) => TONO_ENCENDIDO[$tone]};
  --kz-icon-glow: ${({ $glow }) => ($glow ? '0 0 8px color-mix(in srgb, currentColor 65%, transparent)' : 'none')};
  color: ${({ $active }) => ($active ? 'var(--kz-icon-on)' : fg.muted)};

  svg {
    filter: ${({ $active }) => ($active ? 'drop-shadow(var(--kz-icon-glow))' : 'none')};
    transition: filter ${motion.fast} ${motion.ease};
  }

  &:hover:not([aria-disabled='true']) {
    background: transparent;
    color: ${({ $active }) => ($active ? 'var(--kz-icon-on)' : fg.DEFAULT)};
  }
`;

const Cuenta = styled.span`
  font-size: ${font.xs};
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
`;

/**
 * Botón de reacción: ícono que cambia de color (y opcionalmente resplandece)
 * al activarse, con una cuenta al lado. Generalizado del `IconButton` de
 * taboo-next.
 *
 * No es `IconButton` con más props: `IconButton` tiñe el FONDO cuando está
 * `active` (es "esto está seleccionado" — la página actual, un filtro
 * aplicado). `ReactionButton` nunca tiñe el fondo — sólo el ícono cambia
 * (es "reaccioné con esto"): un corazón marcado no necesita, además, un
 * círculo rosa detrás. Por eso es un componente aparte y no una prop más.
 *
 * ```tsx
 * <ReactionButton tone="danger" active={likeado} glow count={likes} label={`Me gusta, ${likes}`}>
 *   <IconoCorazon />
 * </ReactionButton>
 * ```
 *
 * Un color que los seis tonos no cubren (la marca de un producto, no una
 * categoría semántica), o una intensidad de resplandor propia y no la
 * genérica de `glow`, se pisan con `style`: `--kz-icon-on` y `--kz-icon-glow`
 * son variables CSS comunes, y un estilo en línea le gana a la de acá por
 * origen, no por especificidad — no hace falta tocar la librería por un
 * color o un resplandor que ningún otro consumidor va a repetir.
 *
 * ```tsx
 * <ReactionButton
 *   active={guardado}
 *   style={{
 *     '--kz-icon-on': 'var(--mi-color-de-marca)',
 *     '--kz-icon-glow': '0 0 8px rgba(255, 77, 109, 0.75)',
 *   } as React.CSSProperties}
 *   label="Guardar"
 * >
 *   <IconoMarcador />
 * </ReactionButton>
 * ```
 */
export function ReactionButton({
  label,
  children,
  tone = 'neutral',
  size = 'md',
  active = false,
  glow = false,
  count,
  motivo,
  onClick,
  ...rest
}: Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Props>) {
  const bloqueado = Boolean(motivo);

  return (
    <Raiz
      {...rest}
      type="button"
      $size={size}
      $tone={tone}
      $active={active}
      $glow={glow}
      aria-label={label}
      aria-pressed={active}
      aria-disabled={bloqueado || undefined}
      title={motivo ?? label}
      onClick={(event) => {
        if (bloqueado) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
      {typeof count === 'number' ? <Cuenta aria-hidden="true">{count}</Cuenta> : null}
    </Raiz>
  );
}
