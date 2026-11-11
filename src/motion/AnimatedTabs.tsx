'use client';

import { m, useReducedMotion } from 'motion/react';
import { Tabs, estiloIndicador } from '../ui/Tabs';
import type { TabsIndicadorProps, TabsProps } from '../ui/Tabs';
import { leerTiempos } from './tiempos';

const MarcaBase = {
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: 'none',
  background: 'var(--kz-accent)',
} as const;

/**
 * Indicador por medición, no por `layoutId`. `layoutId` necesita `domMax`
 * (proyección de layout, bastante más pesado que `domAnimation`) y recalcula
 * el layout de cada pestaña; acá `Tabs` ya mide la caja de la elegida, así que
 * basta con animar `x`, `y`, `width` y `height` de un solo `m.span`, que entra
 * en el `domAnimation` del `MotionProvider`. Sin carga diferida extra.
 *
 * Con `prefers-reduced-motion`, salta a su lugar (duración 0): `MotionConfig`
 * sólo apaga los transforms y dejaría animando el ancho.
 */
function IndicadorMotion({ caja, variante, animar }: TabsIndicadorProps) {
  const reducido = useReducedMotion();
  const t = leerTiempos();
  const destino = estiloIndicador({ caja, variante });
  return (
    <m.span
      aria-hidden
      data-indicador=""
      style={{ ...MarcaBase, borderRadius: variante === 'pastilla' ? 'var(--kz-radius-pill)' : 2 }}
      initial={false}
      animate={destino}
      transition={animar && !reducido ? { duration: t.enter, ease: t.easeEnter } : { duration: 0 }}
    />
  );
}

export type AnimatedTabsProps = Omit<TabsProps, 'Indicador'>;

/**
 * Las mismas `Tabs` de `kaizen-lib/ui` (roles, teclado, activación), con el
 * indicador animado por `motion` en vez de la transición CSS. Requiere
 * `MotionProvider` arriba.
 */
export function AnimatedTabs(props: AnimatedTabsProps) {
  return <Tabs {...props} Indicador={IndicadorMotion} />;
}
