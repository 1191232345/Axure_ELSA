import type {
  ColumnDesignRow,
  FilterDesignRow,
  PrototypeDesign,
  RowActionDesignRow,
  ToolbarButtonDesignRow,
} from '../types/prototypeDesign';

export const emptyFilter = (): FilterDesignRow => ({
  label: '',
  inputType: 'text',
  dataSource: '',
  defaultValue: '',
  required: false,
});

export const emptyToolbar = (): ToolbarButtonDesignRow => ({
  label: '',
  logic: '',
  precondition: '',
});

export const emptyColumn = (): ColumnDesignRow => ({
  label: '',
  fieldType: 'text',
  sortable: false,
  format: '',
});

export const emptyRowAction = (): RowActionDesignRow => ({
  label: '',
  logic: '',
  showCondition: '',
});

export function patchDesign(design: PrototypeDesign, patch: Partial<PrototypeDesign>): PrototypeDesign {
  return { ...design, ...patch };
}

export function updateDesignRow<T>(
  design: PrototypeDesign,
  key: keyof PrototypeDesign,
  index: number,
  patch: Partial<T>,
): PrototypeDesign {
  const rows = (design[key] as T[]).map((row, i) => (i === index ? { ...row, ...patch } : row));
  return { ...design, [key]: rows };
}

export function addDesignRow<K extends keyof PrototypeDesign>(
  design: PrototypeDesign,
  key: K,
  factory: () => unknown,
): PrototypeDesign {
  return { ...design, [key]: [...(design[key] as unknown[]), factory()] };
}

export function removeDesignRow(design: PrototypeDesign, key: keyof PrototypeDesign, index: number): PrototypeDesign {
  const rows = [...(design[key] as unknown[])];
  rows.splice(index, 1);
  return { ...design, [key]: rows };
}
