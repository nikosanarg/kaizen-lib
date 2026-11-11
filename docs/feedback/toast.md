# Feedback del frente toast

- Mismo patrón que Modal/AnimatedModal: `ToastProvider` (ui) acepta un adaptador `ToastAnimacion` (`Presence`, `Envoltura`, `item.as/props`); `AnimatedToastProvider` (motion) lo arma. `kaizen-lib/ui` no importa motion.
- `domMax` para `layout` se carga en diferido con un `LazyMotion` anidado dentro de la pila (la `Envoltura`), sin tocar `MotionProvider`.
- Dos regiones siempre montadas: `role="status"`/polite para info y éxito, `role="alert"`/assertive para error. Montarlas junto con el toast hace que muchos lectores no anuncien.
- Duración default 5 s, 8 s con acción; `duration: null` = sólo manual. Pausa con hover o foco adentro, y conserva el tiempo restante (no reinicia).
- Teclado: `Escape` con foco dentro del toast lo cierra. No hay atajo global para saltar a los toasts (F8 estilo Radix): queda para cuando un consumidor lo pida.
- `max` default 3; al pasarse se descarta el más viejo.
- AnimatePresence en modo sync (no `popLayout`: `ToastItem` no reenvía ref). La pila se reacomoda con `layout` igual.
- Sin íconos: `icono` en las opciones, lo pone el producto.
- Sin probar en navegador real; jsdom cubre anuncio, auto-cierre, pausa, teclado y desmontaje tras la salida.
