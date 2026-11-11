/** Cuánto hay que arrastrar el sheet hacia abajo para que cierre. */
export const UMBRAL_ARRASTRE = {
  /** Fracción del alto del panel. */
  fraccion: 0.25,
  /** Tope en px: en un panel alto, no hace falta llevarlo hasta la mitad. */
  maximoPx: 160,
  /** Un tirón rápido cierra aunque el recorrido sea corto (px/s). */
  velocidad: 500,
} as const;

/**
 * Decide si un arrastre terminado cierra el sheet. `desplazamiento` y
 * `velocidad` son el `offset.y` y `velocity.y` que da motion en `onDragEnd`
 * (positivo = hacia abajo); `alto` es el del panel.
 */
export function cierraPorArrastre(desplazamiento: number, velocidad: number, alto: number): boolean {
  if (desplazamiento <= 0) return false;
  if (velocidad >= UMBRAL_ARRASTRE.velocidad) return true;
  const umbral = Math.min(alto * UMBRAL_ARRASTRE.fraccion, UMBRAL_ARRASTRE.maximoPx);
  return desplazamiento >= umbral;
}
