'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ElementType, FocusEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { danger, fg, font, info, radius, ring, shadow, space, success, surface } from '../tokens';

export type ToastTone = 'info' | 'success' | 'error';

export type ToastAccion = {
  label: string;
  /** Después de correr, el toast se cierra. */
  onClick: () => void;
};

export type ToastOpciones = {
  tone?: ToastTone;
  title: ReactNode;
  message?: ReactNode;
  /** Un solo botón: "Deshacer", "Reintentar". */
  action?: ToastAccion;
  /** Ícono a la izquierda: la lib no trae íconos, lo pone el producto. */
  icono?: ReactNode;
  /**
   * Milisegundos hasta el cierre automático. `null` = sólo cierre manual.
   * Default 5000; con `action`, 8000 (hay que llegar a leerla y apretarla).
   */
  duration?: number | null;
};

export type ToastApi = {
  /** Muestra un toast y devuelve su id. */
  show: (opciones: ToastOpciones) => string;
  info: (title: ReactNode, opciones?: Omit<ToastOpciones, 'title' | 'tone'>) => string;
  success: (title: ReactNode, opciones?: Omit<ToastOpciones, 'title' | 'tone'>) => string;
  error: (title: ReactNode, opciones?: Omit<ToastOpciones, 'title' | 'tone'>) => string;
  dismiss: (id: string) => void;
};

export type ToastPosicion = 'bottom-center' | 'bottom-right' | 'top-right';

/**
 * Adaptador de animación, mismo criterio que `ModalAnimacion`: `kaizen-lib/ui`
 * no depende de ninguna librería de movimiento. Lo arma `AnimatedToastProvider`
 * de `kaizen-lib/motion`. `Presence` mantiene montado al toast que sale;
 * `Envoltura` rodea la pila entera (ahí se carga lo que haga falta, p. ej.
 * features de layout).
 */
export type ToastAnimacion = {
  Presence: ComponentType<{ children?: ReactNode }>;
  Envoltura?: ComponentType<{ children?: ReactNode }>;
  item: { as: ElementType; props?: Record<string, unknown> };
};

type ToastVivo = ToastOpciones & { id: string; tone: ToastTone };

const ToastContext = createContext<ToastApi | null>(null);

/** Hook del producto. Fuera de un `ToastProvider` tira: un aviso perdido en silencio es peor. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast necesita un <ToastProvider> (o <AnimatedToastProvider>) arriba.');
  return api;
}

const TONOS: Record<ToastTone, string> = {
  info: info.DEFAULT,
  success: success.DEFAULT,
  error: danger.DEFAULT,
};

const POSICIONES: Record<ToastPosicion, ReturnType<typeof css>> = {
  'bottom-center': css`
    bottom: ${space[6]};
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column-reverse;
  `,
  'bottom-right': css`
    bottom: ${space[6]};
    right: ${space[6]};
    flex-direction: column-reverse;
  `,
  'top-right': css`
    top: ${space[6]};
    right: ${space[6]};
    flex-direction: column;
  `,
};

const Pila = styled.div<{ $posicion: ToastPosicion }>`
  position: fixed;
  z-index: 2147483100;
  display: flex;
  gap: ${space[2]};
  width: min(420px, calc(100vw - ${space[8]}));
  pointer-events: none;
  font-family: ${font.family};
  ${({ $posicion }) => POSICIONES[$posicion]}

  @media (max-width: 480px) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
`;

/** Las regiones viven siempre montadas: un lector anuncia lo que *entra* a una región ya existente. */
const Region = styled.div`
  display: contents;
`;

const Item = styled.div<{ $tone: ToastTone }>`
  display: flex;
  align-items: flex-start;
  gap: ${space[3]};
  padding: ${space[3]} ${space[4]};
  background: ${surface[3]};
  color: ${fg.DEFAULT};
  border-left: 4px solid ${({ $tone }) => TONOS[$tone]};
  border-radius: ${radius.md};
  box-shadow: ${shadow.lg};
  pointer-events: auto;
  outline: none;

  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

const Icono = styled.span<{ $tone: ToastTone }>`
  display: flex;
  flex-shrink: 0;
  color: ${({ $tone }) => TONOS[$tone]};
`;

const Cuerpo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Titulo = styled.p`
  margin: 0;
  font-size: ${font.sm};
  font-weight: 600;
`;

const Mensaje = styled.p`
  margin: ${space[1]} 0 0;
  font-size: ${font.xs};
  color: ${fg.muted};
`;

const botonBase = css`
  flex-shrink: 0;
  border: none;
  border-radius: ${radius.sm};
  background: none;
  cursor: pointer;
  font: inherit;

  &:hover {
    background: ${surface.hover};
  }

  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

const Accion = styled.button<{ $tone: ToastTone }>`
  ${botonBase}
  padding: ${space[1]} ${space[2]};
  font-size: ${font.sm};
  font-weight: 600;
  color: ${({ $tone }) => TONOS[$tone]};
`;

const Cerrar = styled.button`
  ${botonBase}
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 1.125rem;
  line-height: 1;
  color: ${fg.muted};
`;

const duracionDe = (t: ToastOpciones) => (t.duration === undefined ? (t.action ? 8000 : 5000) : t.duration);

function ToastItem({
  toast,
  cerrar,
  closeLabel,
  animacion,
}: {
  toast: ToastVivo;
  cerrar: (id: string) => void;
  closeLabel: string;
  animacion?: ToastAnimacion;
}) {
  const duracion = duracionDe(toast);
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const pausado = hover || foco;
  const restante = useRef(duracion ?? 0);

  useEffect(() => {
    if (duracion === null || pausado) return undefined;
    const inicio = Date.now();
    const timer = setTimeout(() => cerrar(toast.id), restante.current);
    return () => {
      clearTimeout(timer);
      restante.current -= Date.now() - inicio;
    };
  }, [duracion, pausado, cerrar, toast.id]);

  const alTeclear = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    cerrar(toast.id);
  };

  return (
    <Item
      as={animacion?.item.as}
      {...animacion?.item.props}
      $tone={toast.tone}
      data-tone={toast.tone}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFoco(false);
      }}
      onKeyDown={alTeclear}
    >
      {toast.icono ? (
        <Icono $tone={toast.tone} aria-hidden="true">
          {toast.icono}
        </Icono>
      ) : null}
      <Cuerpo>
        <Titulo>{toast.title}</Titulo>
        {toast.message ? <Mensaje>{toast.message}</Mensaje> : null}
      </Cuerpo>
      {toast.action ? (
        <Accion
          type="button"
          $tone={toast.tone}
          onClick={() => {
            toast.action?.onClick();
            cerrar(toast.id);
          }}
        >
          {toast.action.label}
        </Accion>
      ) : null}
      <Cerrar type="button" aria-label={closeLabel} onClick={() => cerrar(toast.id)}>
        ×
      </Cerrar>
    </Item>
  );
}

export type ToastProviderProps = {
  children: ReactNode;
  position?: ToastPosicion;
  /** Toasts visibles a la vez; al pasarse, se descarta el más viejo. Default 3. */
  max?: number;
  /** Nombre accesible de la X. Default `'Cerrar'`. */
  closeLabel?: string;
  /** Entrada, salida y pila animadas. Ver `ToastAnimacion`. */
  animacion?: ToastAnimacion;
};

let contador = 0;

/**
 * Avisos efímeros. Una vez, cerca de la raíz; los componentes los disparan con
 * `useToast()`:
 *
 * ```tsx
 * const toast = useToast();
 * toast.success('Guardado');
 * toast.error('No se pudo borrar', { action: { label: 'Reintentar', onClick: borrar } });
 * ```
 *
 * Accesibilidad: info y éxito entran a una región `role="status"`
 * (`aria-live="polite"`); los errores, a una `role="alert"` (assertive). Ambas
 * están montadas desde el inicio. El cierre automático se pausa con el puntero
 * encima o con el foco adentro; `Escape` con el foco adentro lo cierra.
 */
export function ToastProvider({
  children,
  position = 'bottom-right',
  max = 3,
  closeLabel = 'Cerrar',
  animacion,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastVivo[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const show = (opciones: ToastOpciones) => {
      contador += 1;
      const id = `kz-toast-${contador}`;
      setToasts((lista) => [...lista, { ...opciones, id, tone: opciones.tone ?? 'info' }].slice(-max));
      return id;
    };
    const atajo = (tone: ToastTone) => (title: ReactNode, opciones?: Omit<ToastOpciones, 'title' | 'tone'>) =>
      show({ ...opciones, title, tone });
    return { show, dismiss, info: atajo('info'), success: atajo('success'), error: atajo('error') };
  }, [dismiss, max]);

  const Presence = animacion?.Presence ?? Fragment;
  const Envoltura = animacion?.Envoltura ?? Fragment;
  const region = (errores: boolean) => (
    <Presence>
      {toasts
        .filter((t) => (t.tone === 'error') === errores)
        .map((t) => (
          <ToastItem key={t.id} toast={t} cerrar={dismiss} closeLabel={closeLabel} animacion={animacion} />
        ))}
    </Presence>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted
        ? createPortal(
            <Envoltura>
              <Pila $posicion={position}>
                <Region role="status" aria-live="polite" aria-atomic="false">
                  {region(false)}
                </Region>
                <Region role="alert" aria-live="assertive" aria-atomic="false">
                  {region(true)}
                </Region>
              </Pila>
            </Envoltura>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}
