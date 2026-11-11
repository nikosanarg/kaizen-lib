export { MotionProvider } from './MotionProvider';
export { fade, scale, slideUp, slideSide, presets } from './presets';
export type { Lado, OpcionesPreset, Preset } from './presets';
export { leerTiempos } from './tiempos';
export type { Curva, Tiempos } from './tiempos';
export { AnimatedModal } from './AnimatedModal';
export type { AnimatedModalProps } from './AnimatedModal';
/** Reexportados para que el consumidor no importe `motion` por su cuenta. */
export { AnimatePresence, m } from 'motion/react';
export { AnimatedToastProvider } from './AnimatedToastProvider';
export type { AnimatedToastProviderProps } from './AnimatedToastProvider';
