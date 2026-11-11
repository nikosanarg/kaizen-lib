'use client';

import { useMemo } from 'react';
import { Combobox as Base } from '@base-ui/react/combobox';
import styled from 'styled-components';
import { AvisoLista, Check, Chevron, campo, filaFlotante, focoVisible, listaFlotante, posicionador, superficieFlotante } from './flotante';
import type { SelectOption } from './Select';
import { fg, radius, ring, space } from '../tokens';

export type ComboboxProps<V extends string | number = string> = {
  options: SelectOption<V>[];
  value: V | null;
  /** `null` cuando se limpia la selección. */
  onChange: (value: V | null) => void;
  /** Nombre accesible. Si hay un `<label htmlFor>` afuera, pasá `id` también. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** La lista todavía está llegando. No bloquea el tipeo. */
  loading?: boolean;
  /** Texto cuando el filtro no encuentra nada. */
  emptyText?: string;
  loadingText?: string;
  /** Nombre accesible del botón que limpia la selección. */
  clearLabel?: string;
  name?: string;
  id?: string;
  className?: string;
};

/** minúsculas + sin acentos, para que "perez" encuentre "Pérez". */
const normalizar = (valor: string) => valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const Grupo = styled(Base.InputGroup)`
  ${campo}
  padding: 0;
  gap: 0;

  &:focus-within {
    outline: 2px solid ${ring};
    outline-offset: 2px;
  }
`;

const Entrada = styled(Base.Input)`
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 ${space[3]};
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: 0;

  &::placeholder {
    color: ${fg.subtle};
  }
`;

const BotonIcono = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: ${radius.sm};
  background: transparent;
  color: ${fg.subtle};
  cursor: pointer;
  ${focoVisible}
`;

const Posicionador = styled(Base.Positioner)`
  ${posicionador}
`;

const Panel = styled(Base.Popup)`
  ${superficieFlotante}
  min-width: var(--anchor-width);
`;

const Lista = styled(Base.List)`
  ${listaFlotante}

  &:empty {
    padding: 0;
  }
`;

const Fila = styled(Base.Item)`
  ${filaFlotante}
  justify-content: space-between;
`;

const Indicador = styled(Base.ItemIndicator)`
  display: flex;
  color: ${fg.muted};
`;

const Cruz = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="m4.5 4.5 7 7m-7 0 7-7" />
  </svg>
);

/**
 * Selector con búsqueda: se tipea para filtrar y se elige con flechas +
 * Enter. Parte del `SearchableSelect` de valle-verde, que es la referencia de
 * comportamiento: filtra al instante, sin acentos ni mayúsculas, sobre
 * `label` + `searchText`; la primera coincidencia queda resaltada y Enter la
 * elige; Esc cierra. El foco se queda en el campo y la opción activa se
 * anuncia con `aria-activedescendant` (Base UI).
 *
 * ```tsx
 * <Combobox label="Paciente" placeholder="Por asignar" value={id} onChange={setId}
 *   options={pacientes.map((p) => ({ value: p.id, label: p.nombre, searchText: p.email }))} />
 * ```
 */
export function Combobox<V extends string | number = string>({
  options,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  loading = false,
  emptyText = 'Sin resultados.',
  loadingText = 'Cargando…',
  clearLabel = 'Limpiar',
  name,
  id,
  className,
}: ComboboxProps<V>) {
  const seleccionada = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  return (
    <Base.Root<SelectOption<V>>
      items={options}
      value={seleccionada}
      onValueChange={(opt) => onChange(opt?.value ?? null)}
      itemToStringLabel={(opt) => opt.label}
      itemToStringValue={(opt) => String(opt.value)}
      isItemEqualToValue={(a, b) => a.value === b.value}
      filter={(opt, query) => normalizar(`${opt.label} ${opt.searchText ?? ''}`).includes(normalizar(query.trim()))}
      autoHighlight
      disabled={disabled}
      name={name}
    >
      <Grupo className={className}>
        <Entrada id={id} aria-label={label} placeholder={placeholder} />
        {value !== null && !disabled ? (
          <Base.Clear aria-label={clearLabel} render={<BotonIcono type="button" />}>
            <Cruz />
          </Base.Clear>
        ) : null}
        <Base.Trigger aria-label={label} tabIndex={-1} render={<BotonIcono type="button" />}>
          <Chevron />
        </Base.Trigger>
      </Grupo>
      <Base.Portal>
        <Posicionador sideOffset={4} collisionPadding={8}>
          <Panel aria-busy={loading || undefined}>
            <Base.Empty>
              <AvisoLista>{loading ? loadingText : emptyText}</AvisoLista>
            </Base.Empty>
            <Lista>
              {(opt: SelectOption<V>) => (
                <Fila key={String(opt.value)} value={opt} disabled={opt.disabled}>
                  {opt.label}
                  <Indicador>
                    <Check />
                  </Indicador>
                </Fila>
              )}
            </Lista>
          </Panel>
        </Posicionador>
      </Base.Portal>
    </Base.Root>
  );
}
