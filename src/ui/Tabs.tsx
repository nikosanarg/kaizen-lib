'use client';

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentType, KeyboardEvent, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { accent, fg, font, hairline, motion, radius, ring, space, surface } from '../tokens';

/**
 * Pestañas con el patrón "tabs" de WAI-ARIA: `tablist`, `tab` y `tabpanel`
 * enlazados con `aria-controls` / `aria-labelledby`, roving tabindex (sólo la
 * pestaña elegida está en el orden de Tab), flechas, Inicio y Fin. Elicitado
 * de valle-verde `Tabs`, nsandev-front `Tabs`/`SectionTabs` y soga-front
 * `ProfileTabs`.
 *
 * ## Decisiones
 *
 * - **Activación** `automatica` (default): mover el foco con las flechas
 *   elige la pestaña. `manual`: las flechas sólo mueven el foco y se elige con
 *   Enter o Espacio; para paneles caros de montar o que piden datos.
 * - **Las deshabilitadas se saltean** con las flechas y no se eligen con click.
 * - **Sólo se monta el panel elegido**, salvo `mantenerMontados`. Los demás
 *   quedan como contenedor vacío con `hidden`, para que `aria-controls`
 *   siempre apunte a un elemento que existe.
 * - **El indicador se mide**, no se calcula: posición y ancho de la pestaña
 *   elegida leídos del DOM (y otra vez si la lista cambia de tamaño). Así
 *   sirve con anchos distintos y con scroll horizontal. Acá se desliza con
 *   una transición CSS; `kaizen-lib/motion` trae `AnimatedTabs`, que pasa un
 *   `Indicador` propio por la prop del mismo nombre.
 * - **Controlado o no**: `valor` + `onCambiar`, o `valorInicial`.
 *
 * ```tsx
 * <Tabs label="Secciones" variante="pastilla" items={[
 *   { id: 'datos', etiqueta: 'Datos', contenido: <Datos /> },
 *   { id: 'pagos', etiqueta: 'Pagos', contenido: <Pagos /> },
 * ]} />
 * ```
 */

export type TabItem = {
  id: string;
  etiqueta: ReactNode;
  icono?: ReactNode;
  deshabilitada?: boolean;
  contenido?: ReactNode;
};

export type TabsVariante = 'subrayado' | 'pastilla';
export type TabsActivacion = 'automatica' | 'manual';

/** Caja de la pestaña elegida, relativa a la lista. */
export type TabsCaja = { left: number; top: number; width: number; height: number };

export type TabsIndicadorProps = {
  caja: TabsCaja;
  variante: TabsVariante;
  /** `false` en la primera medición: el indicador aparece en su lugar, sin deslizarse. */
  animar: boolean;
};

export type TabsProps = {
  items: TabItem[];
  /** Nombre accesible de la lista. */
  label: string;
  valor?: string;
  valorInicial?: string;
  onCambiar?: (id: string) => void;
  variante?: TabsVariante;
  activacion?: TabsActivacion;
  mantenerMontados?: boolean;
  /** Reemplaza el indicador por defecto (transición CSS). */
  Indicador?: ComponentType<TabsIndicadorProps>;
  className?: string;
};

const Raiz = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space[4]};
  min-width: 0;
`;

const Lista = styled.div<{ $variante: TabsVariante }>`
  position: relative;
  display: flex;
  gap: ${space[1]};
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  ${({ $variante }) =>
    $variante === 'pastilla'
      ? css`
          width: fit-content;
          padding: ${space[1]};
          background: ${surface.sunken};
          border-radius: ${radius.pill};
        `
      : css`
          box-shadow: inset 0 -1px 0 ${hairline.DEFAULT};
        `}
`;

const Pestana = styled.button<{ $variante: TabsVariante }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: ${space[2]};
  min-height: 44px;
  padding: 0 ${space[4]};
  font: inherit;
  font-size: ${font.md};
  font-weight: 600;
  color: ${fg.muted};
  background: transparent;
  border: none;
  border-radius: ${({ $variante }) => ($variante === 'pastilla' ? radius.pill : radius.sm)};
  cursor: pointer;
  white-space: nowrap;
  transition: color ${motion.fast} ${motion.ease};

  &:hover:not(:disabled) {
    color: ${fg.DEFAULT};
  }
  &[aria-selected='true'] {
    color: ${({ $variante }) => ($variante === 'pastilla' ? accent.fg : fg.DEFAULT)};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

const Marca = styled.span<{ $variante: TabsVariante; $animar: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  background: ${accent.DEFAULT};
  border-radius: ${({ $variante }) => ($variante === 'pastilla' ? radius.pill : '2px')};
  transition: ${({ $animar }) =>
    $animar ? `transform ${motion.enter} ${motion.easeEnter}, width ${motion.enter} ${motion.easeEnter}` : 'none'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/** Altura de la raya en la variante subrayado. */
export const SUBRAYADO_ALTO = 2;

/** Dónde va el indicador dentro de la lista, según la variante. */
export const estiloIndicador = ({ caja, variante }: Pick<TabsIndicadorProps, 'caja' | 'variante'>) =>
  variante === 'pastilla'
    ? { width: caja.width, height: caja.height, x: caja.left, y: caja.top }
    : { width: caja.width, height: SUBRAYADO_ALTO, x: caja.left, y: caja.top + caja.height - SUBRAYADO_ALTO };

function IndicadorCss({ caja, variante, animar }: TabsIndicadorProps) {
  const e = estiloIndicador({ caja, variante });
  return (
    <Marca
      aria-hidden
      data-indicador=""
      $variante={variante}
      $animar={animar}
      style={{ width: e.width, height: e.height, transform: `translate(${e.x}px, ${e.y}px)` }}
    />
  );
}

const Panel = styled.div`
  min-width: 0;
  &[hidden] {
    display: none;
  }
  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

export function Tabs({
  items,
  label,
  valor,
  valorInicial,
  onCambiar,
  variante = 'subrayado',
  activacion = 'automatica',
  mantenerMontados = false,
  Indicador = IndicadorCss,
  className,
}: TabsProps) {
  const base = useId();
  const primera = items.find((i) => !i.deshabilitada)?.id ?? items[0]?.id ?? '';
  const [interno, setInterno] = useState(valorInicial ?? primera);
  const activo = valor ?? interno;
  // En manual, la pestaña con foco puede no ser la elegida: es la que tiene tabIndex 0.
  const [enfocada, setEnfocada] = useState<string | null>(null);
  const tabuladora = enfocada ?? activo;
  const lista = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const [caja, setCaja] = useState<TabsCaja | null>(null);
  const medida = useRef(false);

  const elegir = (id: string) => {
    if (valor === undefined) setInterno(id);
    if (id !== activo) onCambiar?.(id);
  };

  const medir = useCallback(() => {
    const el = refs.current.get(activo);
    if (!el) return setCaja(null);
    setCaja({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  }, [activo]);

  useLayoutEffect(() => {
    medir();
  }, [medir, items.length, variante]);

  useLayoutEffect(() => {
    if (caja) medida.current = true;
  }, [caja]);

  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !lista.current) return;
    const ro = new ResizeObserver(() => medir());
    ro.observe(lista.current);
    return () => ro.disconnect();
  }, [medir]);

  const onKeyDown = (event: KeyboardEvent) => {
    const habilitadas = items.filter((i) => !i.deshabilitada);
    if (habilitadas.length === 0) return;
    const desde = habilitadas.findIndex((i) => i.id === tabuladora);
    const n = habilitadas.length;
    let destino: number | null = null;
    if (event.key === 'ArrowRight') destino = (desde + 1) % n;
    else if (event.key === 'ArrowLeft') destino = desde < 0 ? n - 1 : (desde - 1 + n) % n;
    else if (event.key === 'Home') destino = 0;
    else if (event.key === 'End') destino = n - 1;
    else if (activacion === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      elegir(tabuladora);
      return;
    }
    if (destino === null) return;
    event.preventDefault();
    const id = habilitadas[destino]!.id;
    setEnfocada(id);
    if (activacion === 'automatica') elegir(id);
    refs.current.get(id)?.focus();
  };

  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;

  return (
    <Raiz className={className}>
      <Lista
        ref={lista}
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        $variante={variante}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEnfocada(null);
        }}
      >
        {caja ? <Indicador caja={caja} variante={variante} animar={medida.current} /> : null}
        {items.map((item) => (
          <Pestana
            key={item.id}
            ref={(el: HTMLButtonElement | null) => {
              if (el) refs.current.set(item.id, el);
              else refs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            id={tabId(item.id)}
            aria-selected={item.id === activo}
            aria-controls={panelId(item.id)}
            tabIndex={item.id === tabuladora ? 0 : -1}
            disabled={item.deshabilitada}
            $variante={variante}
            onClick={() => {
              setEnfocada(item.id);
              elegir(item.id);
            }}
          >
            {item.icono}
            {item.etiqueta}
          </Pestana>
        ))}
      </Lista>
      {items.map((item) => {
        const visible = item.id === activo;
        return (
          <Panel
            key={item.id}
            role="tabpanel"
            id={panelId(item.id)}
            aria-labelledby={tabId(item.id)}
            tabIndex={0}
            hidden={!visible}
          >
            {visible || mantenerMontados ? item.contenido : null}
          </Panel>
        );
      })}
    </Raiz>
  );
}
