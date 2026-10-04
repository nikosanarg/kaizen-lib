'use client';

import type { ElementType, MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';
import { accent, fg, font, hairline, motion, ring, surface } from '../tokens';

export type BottomNavItem = {
  /** Identidad del destino: la key de React y lo que compara `activeId`. */
  id: string;
  /** Rótulo visible, siempre presente: en una barra de pulgar el ícono solo no alcanza. */
  label: string;
  /** El ícono. La librería no trae íconos: cada producto usa los suyos. */
  icon: ReactNode;
  href: string;
};

type Props = {
  items: readonly BottomNavItem[];
  /**
   * El ítem de la pantalla actual, o `null` si ninguno. Lo resuelve el
   * producto: si `/` matchea exacto o por prefijo es una regla de sus rutas,
   * no de esta barra.
   */
  activeId: string | null;
  /**
   * Ancho máximo, en px, en el que la barra existe. Arriba se apaga por CSS
   * —no se desmonta— para que no parpadee en la primera pintura: medir la
   * ventana desde JS arranca en "desktop" hasta que hidrata.
   */
  maxWidth: number;
  /** Nombre accesible del `<nav>`. Sin default: el idioma es del producto. */
  ariaLabel: string;
  /**
   * Componente de link (el `<Link>` de Next). Sin esto, `<a>` pelado: la
   * librería no sabe con qué router navega cada producto.
   */
  linkAs?: ElementType;
  /**
   * Se llama al tocar un ítem, antes de navegar. `event.preventDefault()`
   * cancela la navegación: es como un producto le cambia la acción a un
   * destino sin dejar de ser un link (valle-verde abre el escáner desde el
   * ítem del medio cuando ya está en ese eje).
   */
  onSelect?: (item: BottomNavItem, event: MouseEvent<HTMLElement>) => void;
  className?: string;
};

/** Alto de contenido de la barra. El inset del dispositivo se suma aparte. */
const ALTO = '56px';

/**
 * Lo que la barra le quita al viewport por abajo: su alto más el inset del
 * dispositivo. Existe sólo mientras la barra está montada y visible; fuera de
 * eso cae a `0px`. El producto lo usa de padding inferior del contenido y lo
 * suma al `bottom` de lo que flota (FAB, avisos), así nada queda debajo.
 */
export const bottomNavOffset = 'var(--kz-bottom-nav-offset, 0px)';

/**
 * Un `<style>` de React y no `createGlobalStyle`: va en el HTML del servidor
 * igual, y vive y muere con la barra sin depender de cómo cada entorno
 * inyecta estilos globales.
 */
function reglaDeOffset(maxWidth: number): string {
  return `@media (max-width: ${maxWidth}px) { :root { --kz-bottom-nav-offset: calc(${ALTO} + env(safe-area-inset-bottom, 0px)); } }`;
}

const Barra = styled.nav<{ $maxWidth: number }>`
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  /* Translúcida y desenfocada: lo que scrollea por detrás se ve pasar, así la
     barra se lee como una capa encima y no como el final de la página. El
     relleno y el desenfoque van juntos: sin desenfoque, lo de atrás compite
     con los rótulos. El prefijo -webkit- lo sigue pidiendo Safari en iOS, que
     es justo el ancho donde esta barra vive. */
  background: color-mix(in srgb, ${surface[1]} 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* Sombra interna y no border-top: el borde le sumaba 1px al alto y la
     barra tapaba 1px de lo que el offset dejaba libre. */
  box-shadow: inset 0 1px 0 ${hairline.DEFAULT};
  padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);

  @media (max-width: ${({ $maxWidth }) => $maxWidth}px) {
    display: flex;
  }
`;

const Item = styled.a<{ $active: boolean }>`
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: ${ALTO};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: ${({ $active }) => ($active ? accent.DEFAULT : fg.muted)};
  font-family: inherit;
  text-decoration: none;
  transition: color ${motion.fast} ${motion.ease};

  &:focus-visible {
    outline: 2px solid ${ring};
    outline-offset: -2px;
  }

  /* "Acá estoy" no se dice sólo con color: una franja arriba del activo. */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: ${({ $active }) => ($active ? accent.DEFAULT : 'transparent')};
  }

  svg {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    font-size: 22px;
  }
`;

const Rotulo = styled.span<{ $active: boolean }>`
  max-width: 100%;
  font-size: ${font['2xs']};
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Navegación inferior fija para el teléfono: ícono + rótulo por destino, el
 * activo con color y franja. Elicitada de cuatro implementaciones ya
 * duplicadas (mixbol, valle-verde, tuxon, platenzen).
 *
 * Mientras se ve, publica `--kz-bottom-nav-offset` (ver `bottomNavOffset`):
 * es fija, así que sin ese padding el final de la página queda debajo.
 *
 * ```tsx
 * <BottomNav
 *   items={ITEMS}
 *   activeId={ITEMS.find((i) => i.href === pathname)?.id ?? null}
 *   maxWidth={640}
 *   ariaLabel="Secciones"
 *   linkAs={Link}
 * />
 * ```
 */
export function BottomNav({ items, activeId, maxWidth, ariaLabel, linkAs, onSelect, className }: Props) {
  return (
    <>
      <style>{reglaDeOffset(maxWidth)}</style>
      <Barra $maxWidth={maxWidth} aria-label={ariaLabel} className={className}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Item
              key={item.id}
              as={linkAs}
              href={item.href}
              $active={active}
              aria-current={active ? 'page' : undefined}
              onClick={onSelect ? (evento: MouseEvent<HTMLElement>) => onSelect(item, evento) : undefined}
            >
              <span aria-hidden="true" style={{ display: 'contents' }}>
                {item.icon}
              </span>
              <Rotulo $active={active}>{item.label}</Rotulo>
            </Item>
          );
        })}
      </Barra>
    </>
  );
}
