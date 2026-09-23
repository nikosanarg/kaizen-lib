# kaizen-lib

Tokens y componentes compartidos entre los fronts de Kaizen. Un solo paquete, con
subpath exports: cada parte se importa por separado y el resto no entra al bundle.

Se publica en **TypeScript crudo**, sin build. Los consumidores son Next + React 19 +
styled-components con `moduleResolution: "bundler"`, así que lo transpilan ellos.

## Estado

| Subpath | Qué es | Estado |
|---|---|---|
| `kaizen-lib/tokens` | Referencias `var(--kz-*)` tipadas | listo |
| `kaizen-lib/tokens.css` | Valores por defecto, tema oscuro y claro | listo |
| `kaizen-lib/ui` | Componentes (`IconButton`, `ReactionButton`, `Medidor`, `Relieve`, `LangSelector`, `Modal`) | en curso |

## ¿Qué uso para qué?

Antes de escribir un `styled.button` a mano o un ciclador de idioma propio, revisá esta
tabla. Si tu caso está acá, es un defecto reconstruirlo local — usá esto, y si no
alcanza, extendé el componente en vez de bypassearlo (ver `implement.md` del harness:
"un duplicado local de algo que ya existe compartido se reemplaza por el compartido").

| Necesito... | Uso | No es... |
|---|---|---|
| Un botón redondo de sólo ícono en una topbar (notificaciones, perfil, cerrar) | `IconButton` | — |
| Que ese botón tenga fondo teñido cuando está seleccionado (la página actual, un filtro aplicado) | `IconButton` con `active` | `ReactionButton` (ver abajo, distinción a propósito) |
| Un ícono que cambia de color al reaccionar (me gusta, guardar, favorito) — **sin** fondo teñido | `ReactionButton` | `IconButton` con `active` |
| El relieve neumórfico (círculo con sombra, sin relleno) alrededor de un `IconButton` | `Relieve` envolviendo el `IconButton` | una prop de `IconButton` — ver por qué en su docblock |
| Un ciclador de idioma con banderas en la topbar | `LangSelector` | reconstruir el ciclado a mano — ya lo resuelve, con `Relieve` incluido |
| Un panel flotante que bloquea el resto de la página hasta que se resuelve (formulario, confirmación, contenido a pantalla completa) | `Modal` | un overlay propio — portal, foco atrapado, `Escape`, scroll bloqueado y anidamiento ya están resueltos ahí |
| Un arco/medidor que muestra cuánto de un total está ocupado | `Medidor` | un `<progress>` o una barra propia |
| Espaciado, radios, color, tipografía, sombra | `kaizen-lib/tokens` (`space`, `radius`, `fg`, `accent`, `font`, `shadow`, `relief`...) | un valor a mano — cada uno es una referencia `var(--kz-*)` |

Ningún componente trae íconos ni banderas: los recibe como `children`/`icono`, y el
producto elige de dónde salen (`react-icons`, `react-country-flag`, SVG propio).

## Instalación

```bash
npm install kaizen-lib
```

`react` y `styled-components` son **peerDependencies** y las pone el consumidor. Si
alguna vez quedan como `dependencies`, el consumidor termina con dos instancias de
styled-components y se rompen el theming y el SSR de un modo difícil de diagnosticar.

En `next.config`:

```ts
const nextConfig = { transpilePackages: ['kaizen-lib'] };
```

## Tokens

El contrato es uno solo: **los nombres**. Los valores los define cada producto.

```ts
import styled from 'styled-components';
import { surface, fg, space, radius } from 'kaizen-lib/tokens';

const Card = styled.div`
  background: ${surface[2]};
  color: ${fg.DEFAULT};
  padding: ${space[4]};
  border-radius: ${radius.md};
`;
```

```css
/* globals.css — opcional: valores por defecto, después los pisás con los tuyos */
@import 'kaizen-lib/tokens.css';

:root {
  --kz-accent: #e8318f; /* la marca del producto */
}
```

**Adopción parcial.** Si un producto redefine sólo algunos tokens, el resto cae al
valor por defecto. Si no importa `tokens.css` y no define un token que un componente
usa, el estilo simplemente no se aplica — no hay error. Por eso los tests exigen que
todo token de la API esté definido en `defaults.css`.

**Tema.** Oscuro en `:root`; claro cuando `<html>` lleva la clase `light`. Es el
mecanismo de tutipoker-school-front, el único consumidor con toggle real.

**Elevación.** Cuatro niveles de uso fijo: `0` página, `1` panel, `2` card, `3` overlay.
`sunken` es el pozo (inputs, tracks) y va más oscuro que su contenedor.

## Componentes

```tsx
import { IconButton } from 'kaizen-lib/ui';

<IconButton label="Cambiar tema" size="lg" onClick={alternar}>
  <IconoLuna />
</IconButton>

<IconButton as={Link} href="/notificaciones" label="Notificaciones, 3 sin leer" badge={3}>
  <IconoCampana />
</IconButton>
```

**`IconButton`** es el botón redondo de sólo ícono de una topbar. `label` es obligatorio
(es el nombre accesible). Con `badge` dibuja un contador, y ese número es decorativo: la
cuenta va dentro del `label`, porque el idioma no es asunto de la librería. Con `as` toma
otro elemento —un `<Link>` de Next— sin que la librería dependa de Next. `size="lg"` es el
área táctil de 44px. Con `motivo` queda bloqueado pero enfocable, para poder mostrar por
qué.

La librería no trae íconos: cada producto usa los suyos.

```tsx
import { ReactionButton } from 'kaizen-lib/ui';

<ReactionButton tone="danger" active={likeado} glow count={likes} label={`Me gusta, ${likes}`}>
  <IconoCorazon />
</ReactionButton>
```

**`ReactionButton`** es un ícono que cambia de color al reaccionar (`tone`: `neutral` |
`accent` | `success` | `danger` | `warning` | `info`), con resplandor opcional (`glow`,
del mismo color vía `currentColor`) y una cuenta al lado (`count`; `0` se muestra, no es
una ausencia). No es `IconButton` con más props: **nunca tiñe el fondo**. `IconButton` es
"esto está seleccionado" (la página actual, un filtro aplicado) y por eso tiñe el círculo
entero; `ReactionButton` es "reaccioné con esto" (un me gusta, un guardado), y ahí sólo el
ícono cambia — un corazón marcado no necesita, además, un círculo rosa detrás.

Un color que los seis tonos no cubren —la marca de un producto, no una categoría
semántica— se pisa con `style`, porque el color activo sale de la variable CSS
`--kz-icon-on` y un estilo en línea le gana a la regla de la librería:

```tsx
<ReactionButton
  active={guardado}
  style={{ '--kz-icon-on': 'var(--mi-color-de-marca)' } as React.CSSProperties}
  label="Guardar"
>
  <IconoMarcador />
</ReactionButton>
```

```tsx
import { Medidor } from 'kaizen-lib/ui';

<Medidor valor={8} maximo={10} sentido="menos-es-mejor" label="Anotados: 8 de 10" />
```

**`Medidor`** es un arco que dice cuánto de un total está ocupado, pintado por escalón. No es
un control: es un `role="img"`, así que si el dato tiene que llevar a algún lado lo envuelve
un link o un botón del producto. `label` es obligatorio y va en palabras — el arco y el
número del centro son decorativos, y el color nunca es el único portador del significado.

Los cuatro escalones salen de la **proporción** `valor / maximo`, no del valor (8 no significa
lo mismo sobre 10 que sobre 22). Sobre una escala de 0 a 10: `10` tope, `8` a `9,99` alto,
`4` a `7,99` medio, menos de `4` bajo. Cada corte es inclusivo abajo.

`sentido` es obligatorio y decide qué extremo es el bueno, porque eso lo define lo que el
número *significa* en el producto y no el componente:

| Escalón | `menos-es-mejor` | `mas-es-mejor` |
|---|---|---|
| bajo (< 40%) | verde | rojo |
| medio (40–79%) | azul | naranja |
| alto (80–99%) | naranja | azul |
| tope (100%) | rojo | verde |

`menos-es-mejor` es "cuánto lugar queda": vacío es una oportunidad, lleno una puerta
cerrada. `mas-es-mejor` es un progreso o una meta. Usa los tonos `success`, `info`,
`warning` y `danger`, así que un producto que ya los definió no declara nada nuevo. El
centro muestra `valor/maximo` y se reemplaza con `children` cuando el formato es del producto.

```tsx
import { IconButton, Relieve } from 'kaizen-lib/ui';
import Link from 'next/link';

<Relieve>
  <IconButton label="Notificaciones, 3 sin leer" badge={3}><IconoCampana /></IconButton>
</Relieve>

<Relieve $prendido={enPerfil}>
  <IconButton as={Link} href="/perfil" active={enPerfil} label="Perfil"><IconoPerfil /></IconButton>
</Relieve>
```

**`Relieve`** envuelve a `IconButton` con el relieve neumórfico: un círculo sin relleno ni
borde, dibujado por un par de sombras opuestas (`--kz-relief-out`) que se invierten al
presionar (`--kz-relief-in`) o con `$prendido` (el equivalente sostenido de "esto está
activo" o "vos estás acá"). Es un `<span>` alrededor del control y no un
`styled(IconButton)`: `IconButton` es polimórfico (`as`), y styled-components
intercepta el `as` de cualquier componente que envuelve, así que envolverlo así lo haría
saltear toda su lógica. El relieve es neutro por defecto (negro/blanco) — un producto con
marca lo tiñe redefiniendo esos tres tokens, igual que con cualquier otro.

```tsx
import { LangSelector } from 'kaizen-lib/ui';

<LangSelector
  actual={i18n.language}
  onChange={(codigo) => i18n.changeLanguage(codigo)}
  etiqueta={(siguiente) => `Cambiar idioma a ${siguiente.nombre}`}
  opciones={[
    { codigo: 'es', nombre: 'Español', icono: <ReactCountryFlag countryCode="AR" /> },
    { codigo: 'en', nombre: 'English', icono: <ReactCountryFlag countryCode="US" /> },
  ]}
/>
```

**`LangSelector`** es el botón de idioma de una topbar: cicla a la siguiente opción en
cada tap y muestra el ícono del idioma actual, con el relieve de `Relieve` ya incluido
(a diferencia de `IconButton`, acá no hace falta envolverlo aparte — todo consumidor lo
quería). No trae banderas — mismo criterio que `IconButton` no trae íconos —, así que
`icono` es cosa del producto; `react-country-flag` (ya usado en tuxon-front) es una
opción probada. `etiqueta` arma el nombre accesible a partir de la opción siguiente y la
actual — es obligatoria y sin default: la frase y el idioma son del producto (dos ya
difieren: uno anuncia el destino, "Cambiar idioma a English"; otro el estado, "Idioma:
English. Cambiar idioma"). `onChange` recibe el código de la opción siguiente; qué hacer
con eso (`i18n.changeLanguage`, `next-intl`, lo que sea) es del producto — la librería no
sabe qué mecanismo de traducción hay atrás.

```tsx
import { Modal } from 'kaizen-lib/ui';

<Modal
  open={abierto}
  onClose={cerrar}
  title="Eliminar cepa"
  description="Esta acción no se puede deshacer."
  footer={<Acciones><Boton onClick={cerrar}>Cancelar</Boton><Boton onClick={eliminar}>Eliminar</Boton></Acciones>}
>
  <p>Se van a borrar también sus lotes asociados.</p>
</Modal>
```

**`Modal`** es el shell único de un panel flotante: portalea a `document.body`, atrapa el
foco y lo devuelve a quien lo abrió al cerrar, cierra con `Escape`/click afuera/la X, y
bloquea el scroll del fondo. Lleva una pila interna para el anidamiento real (un modal de
confirmación abierto encima de un formulario): sólo el de más arriba atiende `Escape`, y el
scroll se libera recién cuando se cierra el último.

Sin `title` no hay nombre accesible propio — pasá `ariaLabel`. `size` (`sm`|`md`|`lg`|`xl`)
fija el ancho máximo del panel; `maxWidth` lo pisa con un valor explícito. `disableClose`
bloquea la X, el overlay y `Escape` a la vez — para una operación en curso, no para "no
quiero que cierre nunca". `dismissOnOverlay={false}` sólo desactiva el click afuera, para
un formulario a medio llenar que sigue queriendo cerrar con la X o `Escape`. `closeLabel`
(default `'Cerrar'`) es el nombre accesible de la X — mismo criterio que `etiqueta` de
`LangSelector`: un consumidor con más de un idioma lo pisa, el resto no lo toca.

Lo que **no** trae: un `placement` lateral (drawer) y un padding compacto de cuerpo son
casos de un solo consumidor cada uno (`components/ui/Dialog` de valle-verde) — se resuelven
ahí con un wrapper local hasta que un segundo consumidor los pida acá.

## Desarrollo

```bash
npm run check   # typecheck + tests
```

Los tests verifican dos cosas:

- **Paridad** (`tokens.test.ts`): todo token de la API está definido en el CSS y todo
  token del CSS está en la API. El tema claro no inventa tokens ni deja colores sin
  redefinir.
- **Contraste** (`defaults.test.ts`): los pares texto/fondo de la paleta por defecto
  cumplen WCAG 2.1 (4.5:1 texto, 3:1 no textual), en los dos temas.

Si cambiás un color, el número lo da la suite, no el ojo.

## Licencia

MIT
