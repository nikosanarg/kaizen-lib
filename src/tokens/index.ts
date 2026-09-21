/**
 * Nombres de los tokens de diseño de kaizen-lib (`--kz-*`).
 *
 * Esto NO declara valores: son referencias `var(...)` para escribir estilos sin
 * literales mágicos y con autocompletado. Los valores viven en CSS —
 * `defaults.css` acá, o el `globals.css` de cada producto.
 *
 * La regla es de taboo-next, que la aprendió al revés: su `tokens.ts` original
 * declaraba los valores en TypeScript en paralelo a los de `globals.css`, y no
 * lo importaba ni un componente. Dos fuentes de verdad, las dos ignoradas. Por
 * eso acá sólo hay referencias, y `tokens.test.ts` falla si alguna se escapa.
 *
 * El contrato en una línea: si un token está acá, tiene que estar definido en
 * `defaults.css`, y al revés. Los tests lo verifican en las dos direcciones.
 */

/**
 * Superficies por nivel de elevación. El uso de cada nivel es fijo — elegir
 * por "cuánto quiero que resalte" es lo que termina en seis grises distintos
 * que significan lo mismo.
 *
 * - `0` fondo de página
 * - `1` panel o sección
 * - `2` card dentro de un panel
 * - `3` overlay: modal, popover, dropdown
 *
 * `sunken` no es un quinto nivel: va más oscuro que su contenedor (inputs,
 * tracks, wells). `hover` y `active` son estados de una superficie
 * clickeable, no elevaciones.
 */
export const surface = {
  0: 'var(--kz-surface-0)',
  1: 'var(--kz-surface-1)',
  2: 'var(--kz-surface-2)',
  3: 'var(--kz-surface-3)',
  sunken: 'var(--kz-surface-sunken)',
  hover: 'var(--kz-surface-hover)',
  active: 'var(--kz-surface-active)',
} as const;

/**
 * Color de texto sobre una superficie. El texto que va encima de un color de
 * acento o semántico es la ranura `fg` de ese tono (`accent.fg`, `danger.fg`).
 */
export const fg = {
  DEFAULT: 'var(--kz-fg)',
  muted: 'var(--kz-fg-muted)',
  subtle: 'var(--kz-fg-subtle)',
} as const;

/** Bordes de 1px. `strong` es para separar, no para decorar. */
export const hairline = {
  DEFAULT: 'var(--kz-hairline)',
  strong: 'var(--kz-hairline-strong)',
} as const;

/** Anillo de foco. Elemento no textual: el mínimo de contraste es 3:1. */
export const ring = 'var(--kz-ring)';

/**
 * Acento de marca. `soft` es el fondo lavado de chips y estados
 * seleccionados; encima de `soft` va el acento mismo, no `fg`.
 */
export const accent = {
  DEFAULT: 'var(--kz-accent)',
  hover: 'var(--kz-accent-hover)',
  active: 'var(--kz-accent-active)',
  soft: 'var(--kz-accent-soft)',
  fg: 'var(--kz-accent-fg)',
} as const;

/**
 * Tonos semánticos. Tres ranuras cada uno: el color pleno, el fondo lavado y
 * el texto que va encima del pleno.
 */
export const success = {
  DEFAULT: 'var(--kz-success)',
  soft: 'var(--kz-success-soft)',
  fg: 'var(--kz-success-fg)',
} as const;

export const danger = {
  DEFAULT: 'var(--kz-danger)',
  soft: 'var(--kz-danger-soft)',
  fg: 'var(--kz-danger-fg)',
} as const;

export const warning = {
  DEFAULT: 'var(--kz-warning)',
  soft: 'var(--kz-warning-soft)',
  fg: 'var(--kz-warning-fg)',
} as const;

export const info = {
  DEFAULT: 'var(--kz-info)',
  soft: 'var(--kz-info-soft)',
  fg: 'var(--kz-info-fg)',
} as const;

export const shadow = {
  sm: 'var(--kz-shadow-sm)',
  md: 'var(--kz-shadow-md)',
  lg: 'var(--kz-shadow-lg)',
  xl: 'var(--kz-shadow-xl)',
} as const;

/** Escala de espaciado, en pasos de 4px. Las claves salteadas son a propósito. */
export const space = {
  1: 'var(--kz-space-1)',
  2: 'var(--kz-space-2)',
  3: 'var(--kz-space-3)',
  4: 'var(--kz-space-4)',
  5: 'var(--kz-space-5)',
  6: 'var(--kz-space-6)',
  8: 'var(--kz-space-8)',
  10: 'var(--kz-space-10)',
  12: 'var(--kz-space-12)',
  16: 'var(--kz-space-16)',
} as const;

/** Radios. Para 0 no hay token: se escribe `0`. */
export const radius = {
  sm: 'var(--kz-radius-sm)',
  md: 'var(--kz-radius-md)',
  lg: 'var(--kz-radius-lg)',
  xl: 'var(--kz-radius-xl)',
  pill: 'var(--kz-radius-pill)',
  circle: 'var(--kz-radius-circle)',
} as const;

export const font = {
  family: 'var(--kz-font-family)',
  mono: 'var(--kz-font-mono)',
  xs: 'var(--kz-font-xs)',
  sm: 'var(--kz-font-sm)',
  md: 'var(--kz-font-md)',
  lg: 'var(--kz-font-lg)',
  xl: 'var(--kz-font-xl)',
  '2xl': 'var(--kz-font-2xl)',
} as const;

export type Surface = keyof typeof surface;
export type Space = keyof typeof space;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadow;
export type FontSize = Exclude<keyof typeof font, 'family' | 'mono'>;

/** Los cuatro tonos semánticos, para tipar la prop `tone` de un componente. */
export type Tone = 'success' | 'danger' | 'warning' | 'info';

export const tone = { success, danger, warning, info } as const;
