/**
 * Lectura de `defaults.css` para los tests de tokens. No es API pública: no
 * está en `exports` y ningún consumidor debería importarla.
 *
 * Es un lector de declaraciones planas, no un parser de CSS. Sirve porque el
 * archivo sólo tiene dos bloques (`:root` y `:root.light`) y ninguna regla
 * anidada; si eso cambia, `bloque()` falla en voz alta en vez de leer mal.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RUTA = fileURLToPath(new URL('../defaults.css', import.meta.url));

const sinComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Cuerpo del bloque `{ ... }` que abre con el selector dado, exacto. */
function bloque(css: string, selector: string): string {
  const inicio = new RegExp(`(^|\\})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'm').exec(css);
  if (!inicio) throw new Error(`defaults.css no tiene un bloque "${selector}"`);

  const desde = inicio.index + inicio[0].length;
  const hasta = css.indexOf('}', desde);
  if (hasta === -1) throw new Error(`El bloque "${selector}" de defaults.css no cierra`);

  const cuerpo = css.slice(desde, hasta);
  if (cuerpo.includes('{')) throw new Error(`El bloque "${selector}" anida reglas: este lector no las soporta`);
  return cuerpo;
}

function declaraciones(cuerpo: string): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const [, nombre, valor] of cuerpo.matchAll(/(--kz-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    if (nombre && valor) mapa.set(nombre, valor.trim());
  }
  return mapa;
}

const css = sinComentarios(readFileSync(RUTA, 'utf8'));
const root = declaraciones(bloque(css, ':root'));
const light = declaraciones(bloque(css, ':root.light'));

export const declaredInRoot = (): Set<string> => new Set(root.keys());
export const declaredInLight = (): Set<string> => new Set(light.keys());

export type Theme = 'dark' | 'light';

/**
 * Valor efectivo de un token en un tema. El claro hereda de `:root` lo que no
 * redefine, igual que el navegador: leerlo sin ese fallback daría falsos
 * negativos para todo lo que vale igual en los dos temas.
 */
export function valueOf(name: string, theme: Theme): string {
  const value = (theme === 'light' ? light.get(name) : undefined) ?? root.get(name);
  if (value === undefined) throw new Error(`Token ${name} no está definido en defaults.css`);
  return value;
}
