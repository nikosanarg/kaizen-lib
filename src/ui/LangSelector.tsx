'use client';

import type { ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Relieve } from './Relieve';
import type { IconButtonSize } from './shell';

/**
 * Una opción del selector: el código de idioma, su nombre (para el nombre
 * accesible) y el ícono que lo representa. La librería no trae banderas —
 * mismo criterio que `IconButton` no trae íconos — porque una bandera bien
 * hecha es un SVG por país, no algo que valga la pena embeber en un paquete
 * sin build. `react-country-flag` (ya usado en tuxon-front) es una opción
 * probada; cualquier ícono sirve.
 */
export type OpcionDeIdioma<T extends string> = {
  codigo: T;
  /** Nombre del idioma, en ese idioma ("English", no "Inglés"). */
  nombre: string;
  icono: ReactNode;
};

type Props<T extends string> = {
  opciones: OpcionDeIdioma<T>[];
  actual: T;
  onChange: (codigo: T) => void;
  size?: IconButtonSize;
};

/**
 * El botón de idioma de una topbar: cicla a la siguiente opción en cada tap
 * y muestra el ícono del idioma actual. No es un `<select>` ni un menú — es
 * el mismo patrón que ya tenían, cada uno por su cuenta, mixbol-front,
 * nsandev-front, tutipoker-school-front y valle-verde antes de esto.
 *
 * Trae el relieve neumórfico (`Relieve`) incluido: a diferencia de
 * `IconButton`, acá no hace falta envolverlo aparte, porque el 100% de los
 * consumidores lo quería.
 *
 * `onChange` recibe el CÓDIGO de la opción siguiente — qué hacer con eso
 * (`i18n.changeLanguage`, guardarlo en `localStorage`, lo que sea) es del
 * producto. La librería no sabe qué mecanismo de traducción hay atrás.
 *
 * ```tsx
 * <LangSelector
 *   actual={idiomaActual}
 *   onChange={(codigo) => i18n.changeLanguage(codigo)}
 *   opciones={[
 *     { codigo: 'es', nombre: 'Español', icono: <ReactCountryFlag countryCode="AR" /> },
 *     { codigo: 'en', nombre: 'English', icono: <ReactCountryFlag countryCode="US" /> },
 *   ]}
 * />
 * ```
 */
export function LangSelector<T extends string>({ opciones, actual, onChange, size = 'lg' }: Props<T>) {
  // Sin opciones no hay nada que ciclar. Defensivo: un selector de idioma
  // vacío es un error de uso, no algo que la librería deba explicar.
  if (opciones.length === 0) return null;

  const indiceActual = opciones.findIndex((opcion) => opcion.codigo === actual);
  const opcionActual = opciones[indiceActual < 0 ? 0 : indiceActual] as OpcionDeIdioma<T>;
  const siguiente = opciones[(indiceActual + 1 + opciones.length) % opciones.length] as OpcionDeIdioma<T>;

  return (
    <Relieve>
      <IconButton size={size} label={`Cambiar idioma a ${siguiente.nombre}`} onClick={() => onChange(siguiente.codigo)}>
        {opcionActual.icono}
      </IconButton>
    </Relieve>
  );
}
