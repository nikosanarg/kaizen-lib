'use client';

import { Select as Base } from '@base-ui/react/select';
import styled from 'styled-components';
import { Check, Chevron, campo, filaFlotante, listaFlotante, posicionador, superficieFlotante } from './flotante';
import { fg } from '../tokens';

/** Opción de `Select` y `Combobox`. */
export type SelectOption<V extends string | number = string> = {
  value: V;
  label: string;
  /** Sólo `Combobox`: texto extra para buscar (email, código…) que no se muestra. */
  searchText?: string;
  disabled?: boolean;
};

export type SelectProps<V extends string | number = string> = {
  options: SelectOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  /** Nombre accesible. Si hay un `<label htmlFor>` afuera, pasá `id` también. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** Para envío en `<form>` nativo. */
  name?: string;
  id?: string;
  className?: string;
};

const Disparador = styled(Base.Trigger)`
  ${campo}
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
`;

const Valor = styled(Base.Value)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-placeholder] {
    color: ${fg.subtle};
  }
`;

const Icono = styled(Base.Icon)`
  display: flex;
  color: ${fg.subtle};
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
`;

const Fila = styled(Base.Item)`
  ${filaFlotante}
  justify-content: space-between;
`;

const Indicador = styled(Base.ItemIndicator)`
  display: flex;
  color: ${fg.muted};
`;

/**
 * Lista desplegable de una sola elección, sin búsqueda. Para listas largas
 * donde conviene tipear, `Combobox`. Teclado (flechas, Home/End, typeahead,
 * Enter, Esc) y roles (`combobox` + `listbox` + `option`) son de Base UI.
 *
 * ```tsx
 * <Select label="Orden" value={orden} onChange={setOrden}
 *   options={[{ value: 'reciente', label: 'Más reciente' }, { value: 'nombre', label: 'Nombre' }]} />
 * ```
 */
export function Select<V extends string | number = string>({
  options,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  name,
  id,
  className,
}: SelectProps<V>) {
  return (
    <Base.Root<V>
      items={options}
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
      disabled={disabled}
      name={name}
      id={id}
    >
      <Disparador aria-label={label} className={className}>
        <Valor placeholder={placeholder} />
        <Icono>
          <Chevron />
        </Icono>
      </Disparador>
      <Base.Portal>
        <Posicionador alignItemWithTrigger={false} sideOffset={4} collisionPadding={8}>
          <Panel>
            <Lista>
              {options.map((opt) => (
                <Fila key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                  <Base.ItemText>{opt.label}</Base.ItemText>
                  <Indicador>
                    <Check />
                  </Indicador>
                </Fila>
              ))}
            </Lista>
          </Panel>
        </Posicionador>
      </Base.Portal>
    </Base.Root>
  );
}
