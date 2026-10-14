'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { fg, font, hairline, motion, radius, ring, shadow, space, surface } from '../tokens';

/**
 * Un **panel** de una pantalla: una elevación partida en dos. Elicitado de
 * valle-verde (v1.3.13), donde ya lo usaban siete pantallas.
 *
 * - **Cabecera**: el título y, bien a la vista, el **indicador** que resume lo
 *   que hay adentro, con una leyenda chica debajo que dice qué es ese número.
 *   En el extremo, el chevron.
 * - **Cuerpo**: el contenido. Se pliega y se despliega.
 *
 * El indicador es lo que justifica plegar: con el panel cerrado la cabecera
 * sigue diciendo lo que importa, y la pantalla entra entera sin scrollear.
 *
 * ## Decisiones
 *
 * - **Plegado no desmonta.** El cuerpo queda en el DOM con `hidden`: una tabla
 *   con filas seleccionadas o filtros cargados los conserva al reabrir, y no
 *   vuelve a pedir sus datos.
 * - **El control accesible es el chevron**, un botón con `aria-expanded` y
 *   `aria-controls`. Toda la cabecera responde al click por comodidad de mouse
 *   y de dedo, pero no es un botón: adentro lleva un encabezado y un número, y
 *   un botón no puede contener un encabezado.
 * - **Controlado o no**: `abierto` + `onCambiar`, o `abiertoInicial`.
 * - **Se compacta, no desborda.** El plegable es un grid con la columna en
 *   `minmax(0, 1fr)`: sin columna declarada, la implícita medía el ancho
 *   máximo del contenido y una tabla ancha empujaba el panel fuera de la
 *   pantalla (valle-verde 1.4.3).
 *
 * ```tsx
 * <PanelExpandible titulo="Comprometido" indicador={12} leyenda="pacientes sin entrega">
 *   <Tabla />
 * </PanelExpandible>
 * ```
 */

const Raiz = styled.section`
  border-radius: ${radius.lg};
  background: ${surface[1]};
  box-shadow: ${shadow.sm};
  min-width: 0;
`;

const Cabecera = styled.div<{ $abierto: boolean; $plegable: boolean }>`
  display: flex;
  align-items: center;
  gap: ${space[4]};
  padding: ${space[4]} ${space[5]};
  border-radius: ${({ $abierto }) => ($abierto ? `${radius.lg} ${radius.lg} 0 0` : radius.lg)};
  cursor: ${({ $plegable }) => ($plegable ? 'pointer' : 'default')};
  user-select: none;
  transition: background ${motion.fast} ${motion.ease};

  &:hover {
    background: ${({ $plegable }) => ($plegable ? surface.hover : 'transparent')};
  }
`;

const Titulo = styled.h2`
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: ${font.xl};
  font-weight: 600;
  line-height: 1.2;
  color: ${fg.DEFAULT};
  overflow-wrap: anywhere;
`;

const Indicador = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
`;

const Valor = styled.strong`
  font-size: ${font['2xl']};
  font-weight: 600;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: ${fg.DEFAULT};
  white-space: nowrap;
`;

const Leyenda = styled.span`
  font-size: ${font.xs};
  color: ${fg.subtle};
`;

const Indicadores = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${space[2]} ${space[5]};
`;

const Chevron = styled.button<{ $abierto: boolean; $duracion: number }>`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: ${radius.md};
  background: transparent;
  color: ${fg.muted};
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 2px;

  &:focus-visible { outline-color: ${ring}; }

  svg {
    transform: rotate(${({ $abierto }) => ($abierto ? '180deg' : '0deg')});
    transition: transform ${({ $duracion }) => Math.min($duracion, 300)}ms ${motion.ease};
  }

  @media (prefers-reduced-motion: reduce) {
    svg { transition: none; }
  }
`;

const Cuerpo = styled.div`
  padding: ${space[5]};
  border-top: 1px solid ${hairline.DEFAULT};
  min-width: 0;
`;

/*
 * El alto se anima con `grid-template-rows` de 0fr a 1fr: anima hasta el alto
 * real del contenido sin medirlo, que con `height` no se puede (no anima a
 * `auto`). El hijo directo recorta lo que no entra mientras tanto.
 */
const Plegable = styled.div<{ $expandido: boolean; $duracion: number }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: ${({ $expandido }) => ($expandido ? '1fr' : '0fr')};
  transition: grid-template-rows ${({ $duracion }) => $duracion}ms ${motion.ease};

  > div {
    min-height: 0;
    overflow: hidden;
  }

  &[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/**
 * ¿Se anima? Con `prefers-reduced-motion`, y donde el navegador no sabe
 * preguntarlo, el panel se abre y se cierra de una (el estado seguro).
 */
const puedeAnimar = (): boolean =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && typeof window.requestAnimationFrame === 'function'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type PanelExpandibleProps = {
  /** El nombre del panel. Se escribe como se lee: "Comprometido", no "COMPROMETIDO". */
  titulo: string;
  /** El número (o dato) que resume el contenido. Va grande, a la derecha de la cabecera. */
  indicador?: ReactNode;
  /** Qué es el indicador, en una línea corta. */
  leyenda?: ReactNode;
  /** Más de un indicador, cada uno con su leyenda. Con esto, `indicador` y `leyenda` no se miran. */
  indicadores?: { valor: ReactNode; leyenda?: ReactNode }[];
  /**
   * Si el panel se pliega (por defecto, sí). Con `false` conserva el formato pero no
   * tiene chevron ni responde al click: para la pantalla que tiene **un solo** panel.
   */
  plegable?: boolean;
  /** Arranca abierto (por defecto) o plegado, cuando el panel maneja su propio estado. */
  abiertoInicial?: boolean;
  /** Controlado desde afuera. Con esto, `abiertoInicial` no se mira. */
  abierto?: boolean;
  onCambiar?: (abierto: boolean) => void;
  /** Cuánto tarda en plegarse o desplegarse, en ms. Default 300. */
  duracionMs?: number;
  /**
   * Nombre accesible del chevron, sin el título (que se agrega solo). Defaults
   * `'Plegar'` y `'Desplegar'`: un consumidor con más de un idioma los pisa.
   */
  etiquetaPlegar?: string;
  etiquetaDesplegar?: string;
  className?: string;
  children: ReactNode;
};

export function PanelExpandible({
  titulo,
  indicador,
  leyenda,
  indicadores,
  plegable = true,
  abiertoInicial = true,
  abierto: abiertoControlado,
  onCambiar,
  duracionMs = 300,
  etiquetaPlegar = 'Plegar',
  etiquetaDesplegar = 'Desplegar',
  className,
  children,
}: PanelExpandibleProps) {
  const [abiertoPropio, setAbiertoPropio] = useState(abiertoInicial);
  const abierto = !plegable || (abiertoControlado ?? abiertoPropio);

  /*
   * Dos estados además de `abierto`: si el cuerpo está en el árbol visible
   * (`montado`) y si está desplegado (`expandido`). Al abrir, primero se
   * muestra plegado y en el cuadro siguiente se despliega, para que haya algo
   * que animar. Al cerrar, se pliega y recién al terminar se oculta: así lo
   * plegado no queda enfocable ni lo lee un lector de pantalla. Por eso la
   * duración es una prop y no sólo CSS: el temporizador tiene que coincidir.
   */
  const [montado, setMontado] = useState(abierto);
  const [expandido, setExpandido] = useState(abierto);
  useEffect(() => {
    if (!puedeAnimar()) {
      setMontado(abierto);
      setExpandido(abierto);
      return undefined;
    }
    if (abierto) {
      setMontado(true);
      const cuadro = window.requestAnimationFrame(() => setExpandido(true));
      return () => window.cancelAnimationFrame(cuadro);
    }
    setExpandido(false);
    const espera = window.setTimeout(() => setMontado(false), duracionMs);
    return () => window.clearTimeout(espera);
  }, [abierto, duracionMs]);
  const idCuerpo = useId();

  const alternar = () => {
    if (!plegable) return;
    if (abiertoControlado === undefined) setAbiertoPropio(!abierto);
    onCambiar?.(!abierto);
  };

  const hayIndicador = indicador !== undefined && indicador !== null;

  return (
    <Raiz className={className}>
      <Cabecera $abierto={abierto} $plegable={plegable} onClick={alternar}>
        <Titulo>{titulo}</Titulo>
        {indicadores ? (
          <Indicadores>
            {indicadores.map((it, i) => (
              <Indicador key={i}>
                <Valor>{it.valor}</Valor>
                {it.leyenda && <Leyenda>{it.leyenda}</Leyenda>}
              </Indicador>
            ))}
          </Indicadores>
        ) : (hayIndicador || leyenda) && (
          <Indicador>
            {hayIndicador && <Valor>{indicador}</Valor>}
            {leyenda && <Leyenda>{leyenda}</Leyenda>}
          </Indicador>
        )}
        {plegable && (
          <Chevron
            type="button"
            $abierto={abierto}
            $duracion={duracionMs}
            aria-expanded={abierto}
            aria-controls={idCuerpo}
            aria-label={`${abierto ? etiquetaPlegar : etiquetaDesplegar} ${titulo}`}
            // El click sube a la cabecera, que es la que alterna: acá no se repite.
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </Chevron>
        )}
      </Cabecera>
      <Plegable id={idCuerpo} $expandido={expandido} $duracion={duracionMs} hidden={!montado}>
        <div>
          <Cuerpo>{children}</Cuerpo>
        </div>
      </Plegable>
    </Raiz>
  );
}
