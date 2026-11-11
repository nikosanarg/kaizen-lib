# Frente baseui-primitivos — decisiones

- Paquete: `@base-ui/react` 1.9.0 (el viejo `@base-ui-components/react` está deprecado,
  "renamed to @base-ui/react"). Va en `dependencies` con `^1.9.0`, no peer: es detalle de
  implementación, el consumidor no lo toca. Sus peers opcionales (`date-fns`,
  `@date-fns/tz`) no los usa ningún componente nuestro. Pide `react-dom` como peer:
  todo consumidor Next ya lo tiene.
- Subpath: queda en `kaizen-lib/ui`. Medido con esbuild (minify, react/react-dom/
  styled-components externos): importar sólo `Badge` desde el barrel da 0.9 kB gzip y no
  incluye nada de Base UI, o sea que el barrel se sacude bien (`sideEffects: ["*.css"]`).
  Un subpath aparte no ahorraría bytes en producción.
- Peso gzip de importar uno solo: Tooltip 35 kB, Popover 42 kB, Select 47 kB,
  Combobox 54 kB, Menu 63 kB; los cinco 97 kB (núcleo compartido: floating-ui, utils).
- Capa: `z-index` 2147483001, uno arriba del overlay de `Modal`, para poder abrirlos
  dentro de un modal. No se tocó `Modal.tsx`.
- Animación: transición CSS sobre `data-starting-style`/`data-ending-style` (Base UI
  espera al `transitionend` antes de desmontar), apagada con `prefers-reduced-motion`.
  Sin motion.
- Props en inglés, como `Modal` y `Badge` (los más nuevos de la lib).
- Combobox: se dejó afuera el `emptyOptionLabel` de valle-verde (una opción con valor
  `null` dentro de la lista). En Base UI `null` es "sin selección", así que se resuelve
  con `placeholder` + botón Limpiar (`onChange(null)`). Si valle-verde necesita que
  "Por asignar" sea una opción elegible con teclado, se agrega.
- Select: Base UI deja enfocar opciones deshabilitadas con flechas (no las elige). Es el
  patrón ARIA; el test lo fija.
- Menu: sin `trigger` dibuja el botón de tres puntos de mixbol, nombrado por `label`
  (default "Más acciones").
