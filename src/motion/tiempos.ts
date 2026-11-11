/**
 * Duraciones y curvas de entrada/salida, leídas de los tokens `--kz-*` en
 * ejecución. `motion` necesita números, no `var(...)`: por eso se leen del CSS
 * computado y no se copian. Si un consumidor pisa el token, la animación lo
 * sigue. `RESPALDO` sólo se usa sin DOM (SSR) o sin `tokens.css` cargado, y un
 * test lo mantiene igual a `defaults.css`.
 */
export type Curva = [number, number, number, number];

export type Tiempos = {
  /** Segundos. */
  enter: number;
  exit: number;
  easeEnter: Curva;
  easeExit: Curva;
};

export const RESPALDO: Tiempos = {
  enter: 0.22,
  exit: 0.16,
  easeEnter: [0.2, 0, 0, 1],
  easeExit: [0.4, 0, 1, 1],
};

export const parsearDuracion = (valor: string): number | null => {
  const m = /^\s*([\d.]+)\s*(ms|s)\s*$/.exec(valor);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === 'ms' ? n / 1000 : n;
};

export const parsearCurva = (valor: string): Curva | null => {
  const m = /cubic-bezier\(([^)]+)\)/.exec(valor);
  if (!m?.[1]) return null;
  const n = m[1].split(',').map((p) => Number(p.trim()));
  return n.length === 4 && n.every(Number.isFinite) ? (n as Curva) : null;
};

export function leerTiempos(): Tiempos {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return RESPALDO;
  const css = getComputedStyle(document.documentElement);
  const v = (nombre: string) => css.getPropertyValue(nombre);
  return {
    enter: parsearDuracion(v('--kz-duration-enter')) ?? RESPALDO.enter,
    exit: parsearDuracion(v('--kz-duration-exit')) ?? RESPALDO.exit,
    easeEnter: parsearCurva(v('--kz-ease-enter')) ?? RESPALDO.easeEnter,
    easeExit: parsearCurva(v('--kz-ease-exit')) ?? RESPALDO.easeExit,
  };
}
