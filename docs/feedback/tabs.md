# Frente tabs (L5)

- API en castellano como el resto de la lib (`etiqueta`, `valor`, `onCambiar`, `variante`, `activacion`).
- Indicador: se mide la caja de la pestaña elegida (offsetLeft/Top/Width/Height, con ResizeObserver). La versión ui la desliza con transición CSS de transform+width; la de motion anima un `m.span` con x/y/width/height. Se descartó `layoutId`: necesita `domMax` (carga diferida extra y proyección de layout) para algo que ya teníamos medido.
- Reduced motion: CSS sin transición; en motion duración 0 porque `MotionConfig reducedMotion="user"` sólo apaga transforms y dejaría el ancho animando.
- La primera medición no anima (el indicador aparece en su lugar).
- Paneles inactivos: contenedor vacío con `hidden` para que `aria-controls` no apunte a nada inexistente; `mantenerMontados` para conservar estado.
- Deshabilitadas: salteadas por flechas/Home/End.
- Manual: la pestaña con foco tiene tabIndex 0 hasta que el foco sale de la lista; ahí vuelve a la elegida.
- Pendiente: orientación vertical, contadores (valle-verde `count`), `compactOnMobile`/`growActive` de valle-verde quedan en el consumidor.
