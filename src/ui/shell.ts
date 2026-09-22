import { css } from 'styled-components';
import { motion, radius, ring } from '../tokens';

export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Lado del círculo, en px. `lg` es el área táctil mínima de una topbar móvil
 * (44px): si el control va en una barra que se toca con el pulgar, es el que
 * corresponde. No son tokens porque son medidas de este componente, no una
 * escala que otros usen.
 */
export const LADO_ICONO: Record<'sm' | 'md' | 'lg', number> = { sm: 32, md: 40, lg: 44 };

/**
 * Forma compartida entre `IconButton` y `ReactionButton`: el círculo, el
 * foco y el bloqueo. Lo que NO comparten —de dónde sale el color, si hay
 * fondo teñido— es justamente lo que los distingue, y vive en cada uno.
 *
 * `IconButton` es "esto está seleccionado" (fondo teñido, un solo color de
 * encendido). `ReactionButton` es "reaccioné con esto" (sin fondo, color +
 * resplandor por tono, con contador). Forzar los dos casos por una sola
 * prop de color es lo que hacía que una reacción con `tone="heart"` te
 * dejara, de yapa, un círculo rosa detrás del ícono que nadie pidió.
 */
export const formaBase = (size: 'sm' | 'md' | 'lg') => css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${LADO_ICONO[size]}px;
  height: ${LADO_ICONO[size]}px;
  padding: 0;
  border: none;
  border-radius: ${radius.circle};
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition:
    background ${motion.fast} ${motion.ease},
    color ${motion.fast} ${motion.ease};

  svg {
    display: block;
    width: 22px;
    height: 22px;
  }

  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }

  &[aria-disabled='true'] {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
