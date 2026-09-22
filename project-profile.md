# Project Profile — kaizen-lib

Librería compartida de tokens y componentes para los fronts de Kaizen. Los dos temas y
el contrato de nombres están en `README.md`; acá sólo lo que el harness no sabe.

---

## Stack

TypeScript 5.9 estricto. React 19 y styled-components 6 como `peerDependencies`. Vitest.
Sin bundler: se publica TypeScript crudo y cada consumidor lo transpila
(`transpilePackages`).

## Arquitectura

`src/<subpath>/` es un subpath export, declarado en `exports` de `package.json`. Cada
uno tiene su `index.ts` como única puerta pública. `src/<subpath>/testing/` es soporte de
tests y **no** se exporta.

---

## Comandos

| Propósito | Comando |
|---|---|
| Lint | no hay |
| Formateo | no hay |
| Build | no aplica (se publica TypeScript crudo) |
| Tests | `npm test` |
| Suite de verificación antes de cerrar | `npm run check` |
| Levantar el proyecto localmente | no aplica |

---

## Convenciones propias

- Todo token se llama `--kz-*`. Un token nuevo se agrega en **tres** lugares o la suite
  falla: `defaults.css` (`:root`, y `:root.light` si depende del tema), la API en
  `tokens/index.ts`, y —si es un par de color— `PARES` en `defaults.test.ts`.
- `tokens/index.ts` sólo referencia `var(--kz-*)`, nunca declara valores.
- Lo que varía entre productos (paleta, marca) no entra a la lib: entra el nombre, no el
  valor.
- `react` y `styled-components` nunca van en `dependencies`.
- Los consumidores actuales son mixbol, tuxon, platenzen, taboo, kaizen, nsandev y
  tutipoker-school. **taptalk-next y taptalk-android quedan fuera** por decisión explícita.

## Zonas sensibles

- `exports` de `package.json`: renombrar o quitar un subpath rompe a todos los consumidores.
- Un color de `defaults.css` cambia el contraste de un tema entero; la suite lo verifica,
  el ojo no alcanza.

---

## Interfaz

- Sistema de diseño: este repo lo es.
- Tokens: `src/tokens/defaults.css`.

## Tests

- Framework: Vitest.
- Dónde viven los tests: junto a la unidad (`*.test.ts`).
- Umbral de cobertura: no hay.

## Documentación

- Registro de cambios (changelog): no hay.
- Documento de convenciones compartidas: `README.md`.
- Convención de versionado: semver, pero el bump lo decide quien pide el cambio, no el
  tamaño del diff. Por defecto se sube **patch**, incluso cuando el cambio agrega un
  componente o un token. Subir **minor** o **major** requiere que se pida explícitamente
  — no se infiere de que el cambio sea "aditivo" o de que rompa contrato.

## Control de versiones

Repo público en GitHub: `nikosanarg/kaizen-lib`. Licencia MIT.

---

## Responsabilidades que no aplican

`database`.
