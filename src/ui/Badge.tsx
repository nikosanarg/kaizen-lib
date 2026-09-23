'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';
import { accent, danger, fg, font, info, radius, space, success, surface, warning } from '../tokens';

/**
 * El tono resuelve un TRÍO por tabla: fondo lavado, texto y el color pleno
 * (para `bordered`) — así no puede salir una píldora con el texto invisible
 * sobre su propio fondo, ni un borde que no combina con ninguno de los dos.
 */
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

const TONOS: Record<BadgeTone, { fondo: string; texto: string; pleno: string }> = {
  neutral: { fondo: surface.hover, texto: fg.muted, pleno: fg.muted },
  accent: { fondo: accent.soft, texto: accent.fg, pleno: accent.DEFAULT },
  success: { fondo: success.soft, texto: success.fg, pleno: success.DEFAULT },
  danger: { fondo: danger.soft, texto: danger.fg, pleno: danger.DEFAULT },
  warning: { fondo: warning.soft, texto: warning.fg, pleno: warning.DEFAULT },
  info: { fondo: info.soft, texto: info.fg, pleno: info.DEFAULT },
};

type Props = {
  tone?: BadgeTone;
  /** Borde de 1px del color pleno del tono. Para una píldora que necesita más peso que el fondo lavado solo. */
  bordered?: boolean;
  children: ReactNode;
  className?: string;
};

const Raiz = styled.span<{ $tone: BadgeTone; $bordered: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${space[1]};
  padding: 3px ${space[2]};
  border-radius: ${radius.sm};
  border: 1px solid ${({ $tone, $bordered }) => ($bordered ? TONOS[$tone].pleno : 'transparent')};
  font-size: ${font.xs};
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  background: ${({ $tone }) => TONOS[$tone].fondo};
  color: ${({ $tone }) => TONOS[$tone].texto};
`;

/**
 * Píldora de estado: fondo lavado + texto del mismo tono, mayúsculas
 * apretadas. Elicitado de las implementaciones ya duplicadas en tres
 * productos (taboo-next, valle-verde, kaizen-next) — el look es el de
 * valle-verde, que era el más resuelto de los tres.
 *
 * ```tsx
 * <Badge tone="success">Activo</Badge>
 * <Badge tone="danger" bordered>Vencido</Badge>
 * ```
 *
 * `bordered` es opcional: el fondo lavado solo ya es suficiente contraste
 * para la mayoría de los casos (ver `bordered={false}`, el default). Se usa
 * cuando la píldora flota sobre una superficie parecida a su propio fondo y
 * necesita un borde para no perderse — no es una segunda variante estética,
 * es el mismo tono con más peso.
 */
export function Badge({
  tone = 'neutral',
  bordered = false,
  children,
  className,
  ...rest
}: Props & Omit<HTMLAttributes<HTMLSpanElement>, keyof Props>) {
  return (
    <Raiz $tone={tone} $bordered={bordered} className={className} {...rest}>
      {children}
    </Raiz>
  );
}
