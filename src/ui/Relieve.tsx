'use client';

import styled from 'styled-components';
import { motion, relief } from '../tokens';

/**
 * Relieve neumórfico: envuelve a `IconButton` (o cualquier control) y le
 * agrega el par de sombras opuestas que dibuja un círculo sin relleno ni
 * borde. El botón se lee "hundido" al presionar, y "prendido" con `$prendido`
 * — el mismo tratamiento en reposo mientras el estado se sostiene, para "vos
 * estás acá" o "esto está activo".
 *
 * Es un `<span>` alrededor del control, no un `styled(IconButton)`, porque
 * `IconButton` es polimórfico (`as={Link}`): styled-components intercepta su
 * propio `as` en cualquier componente que envuelve, así que envolverlo así
 * haría que renderice el `Link` directo y se saltee toda la lógica de
 * `IconButton` (aria, badge, bloqueo por motivo). El span sólo pinta la
 * sombra; el click, el foco y el aria son enteramente del control de adentro.
 *
 * ```tsx
 * <Relieve>
 *   <IconButton label="Notificaciones" badge={3}><IconoCampana /></IconButton>
 * </Relieve>
 *
 * <Relieve $prendido={enPerfil}>
 *   <IconButton as={Link} href="/perfil" active={enPerfil} label="Perfil">
 *     <IconoPerfil />
 *   </IconButton>
 * </Relieve>
 * ```
 *
 * Nace en mixbol-front y valle-verde, cada uno con su propia paleta —el
 * relieve es neutro (`--kz-relief-*`, negro/blanco) y cada producto lo tiñe
 * redefiniendo esos tres tokens con el color de su marca, igual que hace
 * cualquier otro token de la librería.
 */
export const Relieve = styled.span<{ $prendido?: boolean }>`
  display: inline-flex;
  border-radius: 50%;
  box-shadow: ${({ $prendido }) => ($prendido ? relief.in : relief.out)};
  transition: box-shadow ${motion.fast} ${motion.ease};

  /* $prendido ya vale el relieve hundido: hover no le suma nada. */
  &:hover {
    box-shadow: ${({ $prendido }) => ($prendido ? relief.in : relief.outStrong)};
  }

  &:active {
    box-shadow: ${relief.in};
    transform: translateY(1px);
  }
`;
