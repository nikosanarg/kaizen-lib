'use client';

import { useId } from 'react';
import styled from 'styled-components';
import { CAMISETAS_HAXBALL, type CamisetaHaxball, type NombreCamiseta } from './camisetasHaxball';

export { CAMISETAS_HAXBALL } from './camisetasHaxball';
export type { CamisetaHaxball, NombreCamiseta } from './camisetasHaxball';

type Props = {
  /** Una clave de `CAMISETAS_HAXBALL`, o una camiseta suelta para previsualizar valores que todavía no están en el catálogo. */
  camiseta: NombreCamiseta | CamisetaHaxball;
  /** Lado del cuadrado, en px. */
  size?: number;
  className?: string;
};

/** Ancho de cada franja, en unidades del `viewBox` (0 a 100). No sale de ningún dato de Haxball: es la aproximación que arma un patrón legible sobre un disco de ese tamaño. */
const GROSOR_FRANJA = 16;

/** Alto de sobra del patrón para que, rotado a cualquier ángulo, siga cubriendo el círculo entero (diagonal de un cuadrado de 100 ≈ 141). */
const ALTO_PATRON = 200;

function resolverCamiseta(camiseta: Props['camiseta']): CamisetaHaxball {
  return typeof camiseta === 'string' ? CAMISETAS_HAXBALL[camiseta] : camiseta;
}

const Svg = styled.svg`
  display: block;
  flex-shrink: 0;
`;

/**
 * El disco de Haxball: la ficha con la que un jugador aparece en la cancha,
 * pintada con las franjas que arma `room.setTeamColors(equipo, angulo,
 * colorTexto, colores)` — la única personalización visual que da la API del
 * juego, y la fuente de `CAMISETAS_HAXBALL` (copiada de
 * `kaizen-bot/structure/base.js`).
 *
 * **Es una aproximación, no un renderer pixel-perfect.** No hay documentación
 * pública del algoritmo exacto de Haxball (grosor real de franja, radio real
 * del disco): esto reproduce el modelo general —franjas paralelas rotadas por
 * `angulo`, cicladas por `colores`— calibrado a ojo. Si en algún momento hace
 * falta fidelidad exacta, hay que calibrarlo contra capturas del juego real,
 * no contra esta implementación.
 *
 * No dibuja `colorTexto`: en el juego es el color del número de jugador sobre
 * el disco, y acá no hay ningún número que mostrar (esto es un selector fuera
 * de partida, no una ficha en cancha). El dato queda en `CamisetaHaxball` por
 * si el día de mañana hace falta superponer una inicial o un número.
 */
export function DiscoHaxball({ camiseta, size = 64, className }: Props) {
  const { angulo, colores, nombre } = resolverCamiseta(camiseta);
  const patternId = `disco-haxball-${useId()}`;

  return (
    <Svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Camiseta de ${nombre}`}
      className={className}
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={GROSOR_FRANJA * colores.length}
          height={ALTO_PATRON}
          patternTransform={`rotate(${angulo} 50 50)`}
        >
          {colores.map((color, indice) => (
            <rect key={indice} x={indice * GROSOR_FRANJA} y={0} width={GROSOR_FRANJA} height={ALTO_PATRON} fill={color} />
          ))}
        </pattern>
      </defs>
      <circle cx={50} cy={50} r={48} fill={`url(#${patternId})`} />
    </Svg>
  );
}
