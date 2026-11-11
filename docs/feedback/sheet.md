# Frente sheet (L4)

- `Sheet` y `Drawer` son el `Modal` con una prop nueva y opcional, `posicion`
  (`centro` | `abajo` | `izquierda` | `derecha`, default `centro`). Así heredan foco,
  Escape, pila y `disableClose` sin duplicar el shell. Modal no cambia para quien no la pasa.
- Segunda prop opcional de Modal: `cabecera`, contenido fijo arriba del encabezado y fuera
  del scroll. Existe para el tirador de `AnimatedSheet`.
- El arrastre arranca sólo desde el tirador (`dragListener: false` + `useDragControls`):
  arrastrar el panel entero pelea con el scroll del cuerpo en listas largas.
- El tirador es `aria-hidden`: el cierre accesible es Escape y la X. El `Sheet` sin
  animar no lo dibuja (sin motion no hay arrastre, y un tirador que no tira confunde).
- Umbral de cierre en función pura `cierraPorArrastre` (25% del alto, tope 160px, o
  velocidad >= 500px/s) para testearla sin simular gestos en jsdom, donde motion no arrastra.
- Preset nuevo `desdeBorde(borde)`: recorrido completo (100%), no los 16px de
  `slideUp`/`slideSide`. No lo agregué al objeto `presets` para no reordenar el archivo.
- Alturas: `altura` con `media` (50dvh) y `completa`; un string es alto CSS literal.
- Mixbol abre su Sheet como diálogo centrado desde 768px; acá no: quien lo quiera así usa
  `Modal` en desktop. Queda como posible variante si mixbol migra.
