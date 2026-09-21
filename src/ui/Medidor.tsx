'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { danger, fg, font, info, success, warning } from '../tokens';

/**
 * Hacia dónde apunta lo bueno en la escala.
 *
 * - `menos-es-mejor`: vacío es verde y lleno es rojo. Es la lectura de "cuánto
 *   lugar queda": un partido con dos anotados es una oportunidad, uno lleno es
 *   una puerta cerrada.
 * - `mas-es-mejor`: la inversa. Lleno es verde y vacío es rojo. Es la lectura
 *   de un progreso, una meta o un puntaje.
 *
 * No hay un default universal a propósito: cuál corresponde depende de lo que
 * el número **significa** en el producto, no del componente. Por eso es
 * obligatoria — un default sería elegir en silencio el sentido de todos los
 * medidores que no la pasen.
 */
export type MedidorSentido = 'menos-es-mejor' | 'mas-es-mejor';

/**
 * Los cuatro escalones de la escala, del más vacío al más lleno.
 *
 * Cortes sobre la **proporción** `valor / maximo` y no sobre el valor: sobre
 * una escala de 0 a 10 son 10 → tope, 8 a 9,99 → alto, 4 a 7,99 → medio y
 * menos de 4 → bajo, pero sobre un cupo de 22 el mismo `8` no significa lo
 * mismo. Cada corte es inclusivo abajo: exactamente 8 de 10 ya es `alto`.
 */
type Escalon = 'bajo' | 'medio' | 'alto' | 'tope';

const CORTE_MEDIO = 0.4;
const CORTE_ALTO = 0.8;

function escalonDe(proporcion: number): Escalon {
  if (proporcion >= 1) return 'tope';
  if (proporcion >= CORTE_ALTO) return 'alto';
  if (proporcion >= CORTE_MEDIO) return 'medio';
  return 'bajo';
}

/**
 * Color de cada escalón según el sentido. Los cuatro son los tonos semánticos
 * de la librería —ninguno inventado acá— y las dos rampas usan los mismos
 * cuatro: el `info` (azul) es el escalón templado en las dos direcciones, y es
 * azul y no un cuarto verde/ámbar a propósito, porque los otros tres van por
 * temperatura y meter un cuarto dentro de esa franja los vuelve
 * indistinguibles de un vistazo.
 */
const COLOR: Record<MedidorSentido, Record<Escalon, string>> = {
  'menos-es-mejor': {
    bajo: success.DEFAULT,
    medio: info.DEFAULT,
    alto: warning.DEFAULT,
    tope: danger.DEFAULT,
  },
  'mas-es-mejor': {
    bajo: danger.DEFAULT,
    medio: warning.DEFAULT,
    alto: info.DEFAULT,
    tope: success.DEFAULT,
  },
};

type Props = {
  /** Cuánto hay. Fuera de `0..maximo` se recorta: el arco nunca se sale de su pista. */
  valor: number;
  /** Cuánto es el 100%. Debe ser mayor que 0; si no, el arco se dibuja vacío. */
  maximo: number;
  /**
   * Nombre accesible, obligatorio y en palabras ("Anotados: 8 de 10"). El
   * arco y el número son decorativos (`aria-hidden`): sin esto un lector de
   * pantalla leería el mismo dato dos veces, o ninguna.
   *
   * El color nunca es el único portador del significado: el número va en
   * texto en el centro y esto lo dice en palabras.
   */
  label: string;
  sentido: MedidorSentido;
  /** Lo que va en el centro. Por defecto `valor/maximo`. */
  children?: ReactNode;
};

/**
 * Un semicírculo de 100 unidades de perímetro: `pathLength={100}` hace que
 * `stroke-dashoffset` sea directamente el porcentaje, sin calcular la longitud
 * real del arco.
 */
const ARCO_D = 'M12 52 A38 38 0 0 1 88 52';

const Raiz = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 34px;
`;

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
`;

const Centro = styled.span`
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${font['2xs']};
  font-weight: 800;
  line-height: 1;
  color: ${fg.DEFAULT};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

/** Proporción en `0..1`. Un `maximo` inválido o un valor no finito dan 0, no NaN. */
function proporcionDe(valor: number, maximo: number): number {
  if (!Number.isFinite(valor) || !Number.isFinite(maximo) || maximo <= 0) return 0;
  return Math.min(1, Math.max(0, valor / maximo));
}

/**
 * Medidor de arco: cuánto de un total está ocupado, con el color por escalón.
 *
 * Es un `role="img"`, no un control: no se enfoca ni se opera. Si el dato
 * tiene que llevar a algún lado, lo envuelve un link o un botón del producto.
 */
export function Medidor({ valor, maximo, label, sentido, children }: Props) {
  const proporcion = proporcionDe(valor, maximo);
  const color = COLOR[sentido][escalonDe(proporcion)];

  return (
    <Raiz role="img" aria-label={label}>
      <Svg viewBox="0 0 100 60" aria-hidden="true">
        <path
          d={ARCO_D}
          fill="none"
          stroke={`color-mix(in srgb, ${fg.muted} 25%, transparent)`}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={100}
        />
        <path
          d={ARCO_D}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - proporcion * 100}
        />
      </Svg>
      <Centro aria-hidden="true">{children ?? `${valor}/${maximo}`}</Centro>
    </Raiz>
  );
}
