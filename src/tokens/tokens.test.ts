/**
 * El contrato entre `index.ts` y `defaults.css`.
 *
 * Un token que existe en TypeScript pero no en CSS no rompe el build ni tira
 * un error: `var(--kz-loquesea)` sin definir resuelve a nada y el estilo
 * simplemente no se aplica. Es el modo de falla más caro que tiene una
 * librería de tokens, porque se descubre mirando la pantalla de otro repo.
 * Estos tests lo convierten en un fallo de suite.
 */
import { describe, expect, it } from 'vitest';
import * as tokens from './index';
import { declaredInLight, declaredInRoot } from './testing/css';

/** Todos los `var(--kz-*)` que la API de TypeScript expone, sin repetidos. */
function referencedNames(): Set<string> {
  const names = new Set<string>();

  const walk = (value: unknown): void => {
    if (typeof value === 'string') {
      const match = /^var\((--kz-[a-z0-9-]+)\)$/.exec(value);
      if (match?.[1]) names.add(match[1]);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(walk);
    }
  };

  walk(tokens);
  return names;
}

/** Cada string exportado, con la ruta donde vive, para poder señalar cuál falla. */
function exportedStrings(): Array<[path: string, value: string]> {
  const found: Array<[string, string]> = [];

  const walk = (value: unknown, path: string): void => {
    if (typeof value === 'string') {
      found.push([path, value]);
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        walk(child, path ? `${path}.${key}` : key);
      }
    }
  };

  walk(tokens, '');
  return found;
}

describe('la API de TypeScript sólo referencia, nunca declara valores', () => {
  it.each(exportedStrings())('%s es una referencia var(--kz-*)', (_path, value) => {
    expect(value).toMatch(/^var\(--kz-[a-z0-9-]+\)$/);
  });
});

describe('paridad entre la API de TypeScript y defaults.css', () => {
  it('cada token referenciado en TypeScript está definido en :root', () => {
    const defined = declaredInRoot();
    const faltantes = [...referencedNames()].filter((name) => !defined.has(name)).sort();

    expect(faltantes).toEqual([]);
  });

  it('cada token definido en :root está expuesto por la API de TypeScript', () => {
    const referenced = referencedNames();
    const huerfanos = [...declaredInRoot()].filter((name) => !referenced.has(name)).sort();

    expect(huerfanos).toEqual([]);
  });
});

describe('el tema claro no inventa tokens', () => {
  it('cada token redefinido en :root.light existe en :root', () => {
    const base = declaredInRoot();
    const soloEnClaro = [...declaredInLight()].filter((name) => !base.has(name)).sort();

    expect(soloEnClaro).toEqual([]);
  });

  it('redefine todos los tokens de color y sombra, y ninguno más', () => {
    /*
      El tema claro hereda de `:root` lo que no redefine. Un color que se
      olvida queda con el valor oscuro sobre fondo claro — texto invisible, no
      un desajuste sutil. Al revés, redefinir un espaciado o un radio abre una
      segunda fuente para un valor que no depende del tema.
    */
    const esDependienteDelTema = (name: string) =>
      !/^--kz-(space|radius|font)-/.test(name) && name !== '--kz-font-family' && name !== '--kz-font-mono';

    const esperados = [...declaredInRoot()].filter(esDependienteDelTema).sort();

    expect([...declaredInLight()].sort()).toEqual(esperados);
  });
});
