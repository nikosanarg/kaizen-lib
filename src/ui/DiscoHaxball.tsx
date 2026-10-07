'use client';

import { useId } from 'react';
import styled from 'styled-components';
import { CAMISETAS_HAXBALL, type CamisetaHaxball, type NombreCamiseta } from './camisetasHaxball';
import { recortarAvatarHaxball } from './avatarHaxball';

export { CAMISETAS_HAXBALL } from './camisetasHaxball';
export type { CamisetaHaxball, NombreCamiseta } from './camisetasHaxball';
export { recortarAvatarHaxball, LUGARES_AVATAR_HAXBALL } from './avatarHaxball';

type Props = {
  /** Una clave de `CAMISETAS_HAXBALL`, o una camiseta suelta para previsualizar valores que todavía no están en el catálogo. */
  camiseta: NombreCamiseta | CamisetaHaxball;
  /** El avatar del jugador sobre el disco, en `colorTexto`: lo que no entra se corta con `recortarAvatarHaxball`. */
  texto?: string;
  /** Lado del cuadrado, en px. */
  size?: number;
  className?: string;
};

/** Ancho del `viewBox`: un solo ciclo de colores cubre el disco de punta a punta, como en Haxball — 3 colores son 3 franjas, nunca un patrón que se repite. */
const ANCHO_DISCO = 100;

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
 * `angulo`, una por color y de igual ancho, repartidas sobre el disco—
 * calibrado a ojo. Si en algún momento hace falta fidelidad exacta, hay que
 * calibrarlo contra capturas del juego real, no contra esta implementación.
 *
 * `texto` se dibuja en `colorTexto`, el mismo color que usa el juego para el
 * avatar del jugador sobre el disco.
 */
export function DiscoHaxball({ camiseta, texto, size = 64, className }: Props) {
  const { angulo, colorTexto, colores, nombre } = resolverCamiseta(camiseta);
  const caracteres = texto ? recortarAvatarHaxball(texto) : '';
  const patternId = `disco-haxball-${useId()}`;
  const grosorFranja = ANCHO_DISCO / colores.length;

  return (
    <Svg
      viewBox={`0 0 ${ANCHO_DISCO} ${ANCHO_DISCO}`}
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
          width={ANCHO_DISCO}
          height={ALTO_PATRON}
          patternTransform={`rotate(${angulo} 50 50)`}
        >
          {colores.map((color, indice) => (
            <rect key={indice} x={indice * grosorFranja} y={0} width={grosorFranja} height={ALTO_PATRON} fill={color} />
          ))}
        </pattern>
      </defs>
      <circle cx={50} cy={50} r={48} fill={`url(#${patternId})`} />
      {caracteres && (
        <text
          x={50}
          y={50}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={700}
          fontSize={44}
          fill={colorTexto}
          aria-hidden="true"
        >
          {caracteres}
        </text>
      )}
    </Svg>
  );
}
