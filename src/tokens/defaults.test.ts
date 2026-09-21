/**
 * Contraste de la paleta por defecto contra WCAG 2.1: 4.5:1 para texto normal,
 * 3:1 para elementos no textuales (foco, bordes que portan significado).
 *
 * El enfoque —pares explícitos, calculados del CSS real, en los dos temas— es
 * el de `mixbol-front/scripts/verificar-contraste.mjs`. Acá corre como test
 * para que un valor que rompe el contraste falle la suite y no dependa de que
 * alguien se acuerde de correr un script.
 *
 * Los tonos `soft` son rgba() sobre una superficie: el color final depende de
 * lo que tengan atrás, así que se componen sobre la superficie donde se usan
 * antes de medir.
 */
import { describe, expect, it } from 'vitest';
import { valueOf, type Theme } from './testing/css';

type RGB = [number, number, number];

function parseColor(raw: string): { rgb: RGB; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(raw);
  if (hex?.[1]) {
    const n = parseInt(hex[1], 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 };
  }

  const rgba = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(raw);
  if (rgba) {
    return { rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], alpha: Number(rgba[4]) };
  }

  throw new Error(`Color no soportado por el test de contraste: "${raw}"`);
}

/** Compone `frente` (con alfa) sobre `fondo` opaco. */
function composite(frente: string, fondo: string): RGB {
  const { rgb: f, alpha } = parseColor(frente);
  const { rgb: b } = parseColor(fondo);
  return [0, 1, 2].map((i) => Math.round(f[i]! * alpha + b[i]! * (1 - alpha))) as RGB;
}

function luminance([r, g, b]: RGB): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function ratio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Resuelve un token a RGB opaco; si tiene alfa, lo compone sobre `sobre`. */
function resolve(token: string, theme: Theme, sobre: string): RGB {
  const value = valueOf(token, theme);
  return parseColor(value).alpha < 1 ? composite(value, valueOf(sobre, theme)) : parseColor(value).rgb;
}

const TEXTO = 4.5;
const NO_TEXTUAL = 3;

/**
 * [descripción, token frente, token fondo, mínimo]. Si el fondo es un `soft`,
 * se compone sobre la superficie donde vive, indicada en `SOBRE_SUPERFICIE`.
 */
const PARES: Array<[string, string, string, number]> = [
  ['texto sobre página', '--kz-fg', '--kz-surface-0', TEXTO],
  ['texto sobre panel', '--kz-fg', '--kz-surface-1', TEXTO],
  ['texto sobre card', '--kz-fg', '--kz-surface-2', TEXTO],
  ['texto sobre overlay', '--kz-fg', '--kz-surface-3', TEXTO],
  ['texto sobre pozo', '--kz-fg', '--kz-surface-sunken', TEXTO],
  ['texto sobre hover', '--kz-fg', '--kz-surface-hover', TEXTO],
  ['texto sobre activo', '--kz-fg', '--kz-surface-active', TEXTO],

  ['atenuado sobre página', '--kz-fg-muted', '--kz-surface-0', TEXTO],
  ['atenuado sobre card', '--kz-fg-muted', '--kz-surface-2', TEXTO],
  ['atenuado sobre hover', '--kz-fg-muted', '--kz-surface-hover', TEXTO],
  ['sutil sobre página', '--kz-fg-subtle', '--kz-surface-0', TEXTO],
  ['sutil sobre card', '--kz-fg-subtle', '--kz-surface-2', TEXTO],

  ['anillo de foco sobre página', '--kz-ring', '--kz-surface-0', NO_TEXTUAL],
  ['anillo de foco sobre card', '--kz-ring', '--kz-surface-2', NO_TEXTUAL],

  ['acento como link sobre página', '--kz-accent', '--kz-surface-0', TEXTO],
  ['acento como link sobre card', '--kz-accent', '--kz-surface-2', TEXTO],
  ['texto sobre botón de acento', '--kz-accent-fg', '--kz-accent', TEXTO],
  ['texto sobre botón de acento (hover)', '--kz-accent-fg', '--kz-accent-hover', TEXTO],
  ['texto sobre botón de acento (activo)', '--kz-accent-fg', '--kz-accent-active', TEXTO],
  ['acento sobre su fondo lavado', '--kz-accent', '--kz-accent-soft', TEXTO],

  ...(['success', 'danger', 'warning', 'info'] as const).flatMap(
    (tono): Array<[string, string, string, number]> => [
      [`${tono} como texto sobre card`, `--kz-${tono}`, '--kz-surface-2', TEXTO],
      [`texto sobre botón ${tono}`, `--kz-${tono}-fg`, `--kz-${tono}`, TEXTO],
      [`${tono} sobre su fondo lavado`, `--kz-${tono}`, `--kz-${tono}-soft`, TEXTO],
    ],
  ),
];

/** Superficie sobre la que se compone un fondo con alfa. Todos viven sobre card. */
const SOBRE_SUPERFICIE = '--kz-surface-2';

describe.each<Theme>(['dark', 'light'])('contraste de la paleta por defecto — tema %s', (theme) => {
  it.each(PARES)('%s', (_descripcion, frente, fondo, minimo) => {
    const rgbFondo = resolve(fondo, theme, SOBRE_SUPERFICIE);
    // El frente sobre un fondo con alfa se compone sobre ese fondo ya resuelto.
    const valorFrente = valueOf(frente, theme);
    const rgbFrente =
      parseColor(valorFrente).alpha < 1
        ? composite(valorFrente, `#${rgbFondo.map((c) => c.toString(16).padStart(2, '0')).join('')}`)
        : parseColor(valorFrente).rgb;

    expect(ratio(rgbFrente, rgbFondo), `${frente} sobre ${fondo}`).toBeGreaterThanOrEqual(minimo);
  });
});
