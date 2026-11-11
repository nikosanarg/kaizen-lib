import styled, { css } from 'styled-components';
import { fg, font, hairline, motion, radius, ring, shadow, space, surface } from '../tokens';

/**
 * Piezas compartidas por los flotantes construidos sobre Base UI (Tooltip,
 * Popover, Menu, Select, Combobox). No se exporta: es la forma común, no API.
 *
 * Capa: un punto por encima del overlay de `Modal` (2147483000), para que un
 * Select o un Tooltip abierto DENTRO de un modal no quede tapado por él.
 */
export const CAPA_FLOTANTE = 2147483001;

export const posicionador = css`
  z-index: ${CAPA_FLOTANTE};
  outline: 0;
`;

/**
 * Entrada y salida: opacidad + escala mínima, sólo con transición CSS sobre
 * los atributos que Base UI pone al montar (`data-starting-style`) y al
 * desmontar (`data-ending-style`). Base UI espera a que la transición
 * termine antes de desmontar, así que no hace falta JS de animación.
 * Con `prefers-reduced-motion: reduce` no hay transición: aparece y se va.
 */
export const transicionFlotante = css`
  transform-origin: var(--transform-origin);
  transition:
    opacity ${motion.fast} ${motion.ease},
    transform ${motion.fast} ${motion.ease};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.97);
  }

  &[data-instant] {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/** Superficie de overlay (nivel 3 de la escala). */
export const superficieFlotante = css`
  box-sizing: border-box;
  background: ${surface[3]};
  color: ${fg.DEFAULT};
  border: 1px solid ${hairline.strong};
  border-radius: ${radius.md};
  box-shadow: ${shadow.md};
  font-family: ${font.family};
  font-size: ${font.sm};
  outline: 0;
  ${transicionFlotante}
`;

/** Lista de opciones/acciones dentro del flotante, con alto acotado. */
export const listaFlotante = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: ${space[1]};
  max-height: min(var(--available-height, 320px), 320px);
  overflow-y: auto;
  outline: 0;
`;

/**
 * Fila de opción o acción. El resaltado lo decide Base UI (teclado o puntero)
 * con `data-highlighted`; no se usa `:hover` para no tener dos filas
 * "activas" a la vez.
 */
export const filaFlotante = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  min-height: 36px;
  padding: ${space[2]} ${space[3]};
  border-radius: ${radius.sm};
  cursor: pointer;
  user-select: none;
  outline: 0;
  line-height: 1.3;

  &[data-highlighted] {
    background: ${surface.hover};
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/** Foco visible común a los disparadores que dibuja la lib. */
export const focoVisible = css`
  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

/** Caja de campo cerrado (disparador de Select, grupo de Combobox). */
export const campo = css`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: ${space[2]};
  width: 100%;
  min-height: 40px;
  padding: 0 ${space[3]};
  border: 1px solid ${hairline.strong};
  border-radius: ${radius.md};
  background: ${surface.sunken};
  color: ${fg.DEFAULT};
  font-family: ${font.family};
  font-size: ${font.sm};
  ${focoVisible}

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/** Texto de estado vacío / cargando dentro de una lista. */
export const AvisoLista = styled.div`
  padding: ${space[2]} ${space[3]};
  color: ${fg.subtle};
  font-size: ${font.sm};
`;

export const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

export const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="m3 8.5 3.5 3.5 6.5-8" />
  </svg>
);
