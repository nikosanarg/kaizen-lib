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
| `kaizen-lib/ui` | Componentes | pendiente |

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
