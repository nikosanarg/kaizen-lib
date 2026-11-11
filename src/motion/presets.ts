import type { TargetAndTransition } from 'motion/react';
import { leerTiempos } from './tiempos';
import type { Tiempos } from './tiempos';

/**
 * Un preset se esparce sobre un `m.*`: `<m.div {...fade()} />`. Tiene las
 * tres fases que usa `AnimatePresence`; la transición de cada una sale de los
 * tokens de entrada/salida. Es la API sobre la que se apoyan toasts, sheet,
 * tabs y demás: los nombres y la forma no cambian sin bump.
 */
export type Preset = {
  initial: Record<string, number | string>;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

export type Lado = 'left' | 'right';

/** Pisar duraciones o curvas puntuales sin salirse de los tokens para el resto. */
export type OpcionesPreset = { tiempos?: Partial<Tiempos> };

const armar = (
  oculto: Record<string, number | string>,
  visible: Record<string, number | string>,
  opciones?: OpcionesPreset,
): Preset => {
  const t = { ...leerTiempos(), ...opciones?.tiempos };
  return {
    initial: oculto,
    animate: { ...visible, transition: { duration: t.enter, ease: t.easeEnter } },
    exit: { ...oculto, transition: { duration: t.exit, ease: t.easeExit } },
  };
};

/** Sólo opacidad. Lo único que queda con `prefers-reduced-motion`. */
export const fade = (opciones?: OpcionesPreset) => armar({ opacity: 0 }, { opacity: 1 }, opciones);

/** Opacidad y escala desde 0.96: paneles centrados (modal, popover). */
export const scale = (opciones?: OpcionesPreset) =>
  armar({ opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1 }, opciones);

/** Sube 16px: lo que entra desde abajo (sheet, toast en mobile). */
export const slideUp = (opciones?: OpcionesPreset) =>
  armar({ opacity: 0, y: 16 }, { opacity: 1, y: 0 }, opciones);

/** Entra desde un costado (`right` por defecto): toasts, paneles laterales. */
export const slideSide = (lado: Lado = 'right', opciones?: OpcionesPreset) =>
  armar({ opacity: 0, x: lado === 'right' ? 16 : -16 }, { opacity: 1, x: 0 }, opciones);

export const presets = { fade, scale, slideUp, slideSide } as const;

export type Borde = 'bottom' | Lado;

/**
 * Entra desde fuera de la pantalla por un borde, el recorrido entero del
 * panel: sheet (`bottom`) y drawer (`left`/`right`). Con
 * `prefers-reduced-motion` queda el fade.
 */
export const desdeBorde = (borde: Borde = 'bottom', opciones?: OpcionesPreset) =>
  borde === 'bottom'
    ? armar({ opacity: 0, y: '100%' }, { opacity: 1, y: 0 }, opciones)
    : armar({ opacity: 0, x: borde === 'right' ? '100%' : '-100%' }, { opacity: 1, x: 0 }, opciones);
