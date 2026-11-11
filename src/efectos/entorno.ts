'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Sigue una media query. En SSR y en el primer render devuelve `inicial`. */
function useMedia(q: string, inicial: boolean): boolean {
  const [v, setV] = useState(inicial);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setV(false);
      return;
    }
    const mq = window.matchMedia(q);
    const actualizar = () => setV(mq.matches);
    actualizar();
    mq.addEventListener?.('change', actualizar);
    return () => mq.removeEventListener?.('change', actualizar);
  }, [q]);
  return v;
}

/**
 * `true` con `prefers-reduced-motion: reduce`. Arranca en `true` hasta montar:
 * el HTML del servidor trae el estado final y nada se mueve antes de saber.
 */
export const usePrefiereReducido = () => useMedia('(prefers-reduced-motion: reduce)', true);

/** Puntero fino con hover real (mouse, trackpad). En táctil, `false`. */
export const useTieneHover = () => useMedia('(hover: hover) and (pointer: fine)', false);

/**
 * `true` mientras el elemento está en pantalla y la pestaña visible. Lo que
 * anima en bucle se pausa con esto. Sin IntersectionObserver se asume en pantalla.
 */
export function useActivo(ref: RefObject<Element | null>): boolean {
  const [enPantalla, setEnPantalla] = useState(false);
  const [pestana, setPestana] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setEnPantalla(true);
      return;
    }
    const io = new IntersectionObserver((e) => setEnPantalla(e.some((x) => x.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const actualizar = () => setPestana(document.visibilityState !== 'hidden');
    actualizar();
    document.addEventListener('visibilitychange', actualizar);
    return () => document.removeEventListener('visibilitychange', actualizar);
  }, []);

  return enPantalla && pestana;
}

/** Se vuelve `true` la primera vez que el elemento entra en pantalla, y queda así. */
export function useVisto(ref: RefObject<Element | null>): boolean {
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    if (visto) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisto(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, visto]);
  return visto;
}

/**
 * Agrupa eventos de puntero en un rAF: a lo sumo una escritura por frame y
 * ninguna sin movimiento. Escribe variables CSS sin re-render de React.
 */
export function crearAgendador(escribir: () => void) {
  let id = 0;
  return {
    pedir() {
      if (id) return;
      id = requestAnimationFrame(() => {
        id = 0;
        escribir();
      });
    },
    cancelar() {
      if (id) cancelAnimationFrame(id);
      id = 0;
    },
  };
}

/** Sólo mouse o lápiz siguen; el toque no inclina ni mueve halos. */
export const esPunteroFino = (e: PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen';
