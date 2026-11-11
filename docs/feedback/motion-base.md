# Feedback del frente motion-base

- Tokens nuevos `--kz-duration-enter/exit`, `--kz-ease-enter/exit` (defaults.css + tokens/index.ts; no son color, así que no van a PARES; se sumaron las curvas a la lista de no dependientes del tema en tokens.test.ts).
- `motion` necesita números: los presets leen los tokens del CSS computado (`leerTiempos`), con un respaldo para SSR que un test mantiene igual a defaults.css. En SSR el primer render usa el respaldo; si un producto pisa los tokens, el cambio se ve en cliente.
- Modal: en vez de duplicar su lógica, `Modal` acepta un adaptador `animacion` (Presence + `as` del overlay y del panel con sus props). `kaizen-lib/ui` no importa motion. `AnimatedModal` en `kaizen-lib/motion` lo arma.
- Durante la salida, la pila, el scroll y el foco ya se liberaron (los efectos dependen de `open`): el panel que se va no atrapa foco ni atiende Escape. A propósito.
- `MotionProvider` usa `LazyMotion strict`: un `motion.div` dentro tira error. Las piezas siguientes (toasts, sheet, tabs, número) deben usar `m.*`.
- Sin probar en navegador real: los tests en jsdom confirman desmontaje tras la salida, Escape y modo ocupado.
