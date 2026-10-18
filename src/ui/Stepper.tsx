'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { accent, fg, font, hairline, motion, space, surface } from '../tokens';

/**
 * Pasos de un recorrido: círculos unidos por líneas. Elicitado del stepper del
 * formulario de adhesión de valle-verde (`FormV2Stepper`).
 *
 * Cada paso es un estado de tres: **completo** (antes del actual), **actual** y
 * **pendiente**. Completo y actual se pintan igual —el actual suma un halo y la
 * etiqueta en negrita—; la línea que une dos pasos se llena cuando el de la
 * derecha se alcanza.
 *
 * ## Decisiones
 *
 * - **Se anima por defecto.** Al avanzar, la línea se llena primero y el
 *   círculo se pinta cuando ella llega; al retroceder, al revés. Un salto de
 *   varios pasos llena las líneas en cadena, una tras otra. Con
 *   `prefers-reduced-motion` (o `animado={false}`) cambia de una.
 * - **Es un `<ol>`, no un control.** El paso actual lleva
 *   `aria-current="step"`. Si los pasos tienen que ser clickeables, es otro
 *   componente: un stepper que navega tiene que resolver qué pasos se pueden
 *   visitar, y eso es del producto.
 * - **La paleta sale de los tokens**, y cada producto la pisa con variables
 *   propias del componente sobre la raíz (o un ancestro), sin forkearlo:
 *
 *   | Variable | Qué pinta | Default |
 *   |---|---|---|
 *   | `--kz-stepper-pleno` | La línea llena, el borde y el ícono de un paso alcanzado | `accent` |
 *   | `--kz-stepper-lavado` | El fondo de un paso alcanzado | `accent.soft` |
 *   | `--kz-stepper-pista` | La línea vacía | `hairline.strong` |
 *   | `--kz-stepper-pendiente` | El fondo de un paso pendiente | `surface.sunken` |
 *   | `--kz-stepper-tamano` | El diámetro del círculo | `40px` |
 *   | `--kz-stepper-grosor` | El grosor de la línea | `4px` |
 *
 * - **Ocupa el ancho de su contenedor**, en columnas iguales: para un stepper
 *   compacto, el contenedor le pone `max-width`.
 *
 * ```tsx
 * <Stepper
 *   label="Pasos de la adhesión"
 *   actual={paso}
 *   pasos={[
 *     { etiqueta: 'Datos', icono: <FaUser /> },
 *     { etiqueta: 'Necesidades', icono: <FaLeaf /> },
 *     { etiqueta: 'Confirmación', icono: <FaCheck /> },
 *   ]}
 * />
 * ```
 */

export type PasoStepper = {
  /** El nombre del paso. Se lee siempre, aunque `ocultarEtiquetasBajo` lo esconda a la vista. */
  etiqueta: ReactNode;
  /** Lo que va en el círculo. Sin ícono, el número del paso. */
  icono?: ReactNode;
};

export type StepperProps = {
  pasos: PasoStepper[];
  /** Índice del paso actual, desde 0. Fuera de rango se recorta. */
  actual: number;
  /** Nombre accesible de la lista ("Pasos de la adhesión"). */
  label: string;
  /** Si los cambios de paso se animan (por defecto, sí). */
  animado?: boolean;
  /** Cuánto tarda en llenarse cada línea, en ms. Default 300. */
  duracionMs?: number;
  /**
   * Debajo de este ancho de pantalla (px) las etiquetas no se dibujan; quedan
   * para el lector de pantalla. Sin esto, se ven siempre.
   */
  ocultarEtiquetasBajo?: number;
  className?: string;
};

type Estado = 'completo' | 'actual' | 'pendiente';

const PLENO = `var(--kz-stepper-pleno, ${accent.DEFAULT})`;
const LAVADO = `var(--kz-stepper-lavado, ${accent.soft})`;
const PISTA = `var(--kz-stepper-pista, ${hairline.strong})`;
const PENDIENTE = `var(--kz-stepper-pendiente, ${surface.sunken})`;
const TAMANO = 'var(--kz-stepper-tamano, 40px)';
const GROSOR = 'var(--kz-stepper-grosor, 4px)';

/** Aire entre el círculo y la punta de la línea. */
const SEPARACION = '6px';

const Lista = styled.ol`
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Paso = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${space[2]};
  min-width: 0;
`;

/**
 * La línea va del borde derecho de este círculo al izquierdo del siguiente: la
 * dibuja cada paso salvo el último. El relleno es un `scaleX` (no un `width`),
 * que el navegador anima sin recalcular el layout.
 */
const Linea = styled.span<{ $llena: boolean; $duracion: number; $demora: number }>`
  position: absolute;
  top: calc(${TAMANO} / 2 - ${GROSOR} / 2);
  left: calc(50% + ${TAMANO} / 2 + ${SEPARACION});
  right: calc(-50% + ${TAMANO} / 2 + ${SEPARACION});
  height: ${GROSOR};
  border-radius: 999px;
  background: ${PISTA};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${PLENO};
    transform-origin: left center;
    transform: scaleX(${({ $llena }) => ($llena ? 1 : 0)});
    transition: transform ${({ $duracion }) => $duracion}ms ${motion.ease} ${({ $demora }) => $demora}ms;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after { transition: none; }
  }
`;

const Circulo = styled.span<{ $estado: Estado; $duracion: number; $demora: number }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${TAMANO};
  height: ${TAMANO};
  flex-shrink: 0;
  border-radius: 50%;
  font-size: calc(${TAMANO} * 0.4);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  ${({ $estado }) => ($estado === 'pendiente'
    ? css`
      color: ${fg.subtle};
      background: ${PENDIENTE};
      border: 1px solid ${hairline.DEFAULT};
      box-shadow: 0 0 0 0 transparent;
    `
    : css`
      color: ${PLENO};
      background: ${LAVADO};
      border: 1px solid color-mix(in srgb, ${PLENO} 35%, transparent);
      box-shadow: 0 0 0 ${$estado === 'actual' ? '4px' : '0'} color-mix(in srgb, ${PLENO} 16%, transparent);
    `)}
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: ${({ $duracion }) => $duracion}ms;
  transition-timing-function: ${motion.ease};
  transition-delay: ${({ $demora }) => $demora}ms;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Etiqueta = styled.span<{ $estado: Estado; $ocultarBajo?: number }>`
  max-width: 100%;
  font-family: ${font.family};
  font-size: ${font.xs};
  font-weight: ${({ $estado }) => ($estado === 'actual' ? 700 : 500)};
  line-height: 1.3;
  color: ${({ $estado }) => ($estado === 'actual' ? fg.DEFAULT : fg.muted)};
  text-align: center;
  overflow-wrap: anywhere;

  ${({ $ocultarBajo }) => $ocultarBajo !== undefined && css`
    @media (max-width: ${$ocultarBajo - 0.02}px) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `}
`;

const estadoDe = (indice: number, actual: number): Estado => {
  if (indice < actual) return 'completo';
  if (indice === actual) return 'actual';
  return 'pendiente';
};

/**
 * Cuánto espera cada pieza para que el cambio se lea en orden. Avanzando de
 * `desde` a `hasta`, la línea `i` (entre los pasos `i` e `i + 1`) se llena
 * después de las anteriores, y el círculo `i + 1` se pinta cuando su línea
 * termina. Retrocediendo, el espejo: el círculo se apaga a la vez que empieza a
 * vaciarse su línea, y el anterior cuando ella termina.
 */
function demoras(desde: number, hasta: number, duracion: number) {
  const linea = (i: number): number => {
    if (hasta > desde && i >= desde && i < hasta) return (i - desde) * duracion;
    if (hasta < desde && i >= hasta && i < desde) return (desde - 1 - i) * duracion;
    return 0;
  };
  const circulo = (i: number): number => {
    if (hasta > desde && i > desde && i <= hasta) return (i - desde) * duracion;
    if (hasta < desde && i > hasta && i <= desde) return (desde - i) * duracion;
    return 0;
  };
  return { linea, circulo };
}

export function Stepper({
  pasos,
  actual,
  label,
  animado = true,
  duracionMs = 300,
  ocultarEtiquetasBajo,
  className,
}: StepperProps) {
  const ultimo = Math.max(0, pasos.length - 1);
  const indice = Number.isFinite(actual) ? Math.min(ultimo, Math.max(0, Math.trunc(actual))) : 0;

  // El paso que se mostraba antes de este render: de ahí sale el sentido del cambio.
  const previo = useRef(indice);
  const desde = previo.current;
  useEffect(() => {
    previo.current = indice;
  }, [indice]);

  const duracion = animado ? Math.max(0, duracionMs) : 0;
  const { linea, circulo } = demoras(desde, indice, duracion);

  return (
    <Lista aria-label={label} className={className}>
      {pasos.map((paso, i) => {
        const estado = estadoDe(i, indice);
        return (
          <Paso key={i} aria-current={estado === 'actual' ? 'step' : undefined} data-estado={estado}>
            {i < ultimo && (
              <Linea aria-hidden="true" $llena={i < indice} $duracion={duracion} $demora={linea(i)} />
            )}
            <Circulo aria-hidden="true" $estado={estado} $duracion={duracion} $demora={circulo(i)}>
              {paso.icono ?? i + 1}
            </Circulo>
            <Etiqueta $estado={estado} $ocultarBajo={ocultarEtiquetasBajo}>{paso.etiqueta}</Etiqueta>
          </Paso>
        );
      })}
    </Lista>
  );
}
