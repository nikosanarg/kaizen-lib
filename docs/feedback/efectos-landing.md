# Feedback del frente efectos-landing

- Subpath nuevo `kaizen-lib/efectos`, separado de `ui` y `motion`.
- Sin `motion`: los cinco efectos son CSS + variables escritas desde JS. HeroText con `motion` hubiera exigido `MotionProvider` y su bundle; con keyframes y `animation-delay: calc(var(--i) * escalon)` alcanza. Si algún consumidor quiere variantes de motion, se suma después sin romper la API.
- Puntero: listeners pasivos y agrupados en un rAF; nada corre sin movimiento. Sólo `pointerType` mouse/pen; con `(hover: hover) and (pointer: fine)` falso no se registran listeners.
- `usePrefiereReducido` arranca en `true` hasta montar: el SSR sale en estado final.
- HeroText: texto entero en un span visualmente oculto y piezas `aria-hidden`; el SSR trae el texto visible y recién en layout effect (si no hay reduced-motion) pasa a `espera`. Tope de escalonado total (`topeTotal`, 1200 ms) para textos largos.
- StarField unificado: misma gaussiana de taboo/nsandev (centro 50/62.5, dispersión 25). Diferencias: SVG único, 3 grupos que titilan en vez de 300 animaciones, color por prop (taboo usa `#bb7fff`), `modo="fijo"` reproduce el `position: fixed; z-index: -1` de ellos. Default `relleno`.
- Beams: SVG `preserveAspectRatio="none"` + `vector-effect: non-scaling-stroke`; pulso por `stroke-dashoffset` con `pathLength=100`.
- No hay tokens nuevos: el color sale de `--kz-accent`/`--kz-accent-soft` y se pisa por prop.
- Sin probar en navegador real; jsdom cubre render, reduced-motion, táctil, pausa por pestaña oculta y orden de foco.
