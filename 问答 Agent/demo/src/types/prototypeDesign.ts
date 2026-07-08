export type FilterInputType = 'text' | 'select' | 'dateRange' | 'multiSelect' | 'picker';
export type ColumnFieldType = 'text' | 'status' | 'datetime' | 'amount' | 'link';

export interface FilterDesignRow {
  label: string;
  inputType: FilterInputType;
  dataSource: string;
  defaultValue: string;
  required: boolean;
}

export type ToolbarButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'purple'
  | 'accent'
  | 'success'
  | 'warning'
  | '';

export interface ToolbarButtonDesignRow {
  label: string;
  logic: string;
  precondition: string;
  /** 按钮样式；空表示自动推断 */
  variant?: ToolbarButtonVariant;
  /** 颜色别名，与 variant 二选一 */
  color?: string;
}

export interface ColumnDesignRow {
  label: string;
  fieldType: ColumnFieldType;
  sortable: boolean;
  format: string;
}

export interface RowActionDesignRow {
  label: string;
  logic: string;
  showCondition: string;
}

export interface PrototypeDesign {
  moduleName: string;
  breadcrumb: string;
  notes: string;
  filters: FilterDesignRow[];
  toolbarButtons: ToolbarButtonDesignRow[];
  columns: ColumnDesignRow[];
  rowActions: RowActionDesignRow[];
}

export interface PrototypeGenerateResult {
  pageId: string;
  moduleName: string;
  breadcrumb?: string;
  previewUrl: string;
  enriched?: boolean;
}

export const TOOLBAR_VARIANT_OPTIONS: { value: ToolbarButtonVariant; label: string }[] = [
  { value: '', label: '自动' },
  { value: 'primary', label: '主色（蓝）' },
  { value: 'secondary', label: '次要（灰）' },
  { value: 'danger', label: '危险（红）' },
  { value: 'purple', label: '紫色' },
  { value: 'accent', label: '强调（黄）' },
  { value: 'success', label: '成功（绿）' },
  { value: 'warning', label: '警告（橙）' },
];

export type DesignSection = 'basic' | 'filters' | 'toolbar' | 'columns' | 'rowActions';

export const FILTER_INPUT_OPTIONS: { value: FilterInputType; label: string }[] = [
  { value: 'text', label: '文本输入' },
  { value: 'select', label: '下拉单选' },
  { value: 'dateRange', label: '日期范围' },
  { value: 'multiSelect', label: '下拉多选' },
  { value: 'picker', label: '弹窗选择' },
];

export const COLUMN_TYPE_OPTIONS: { value: ColumnFieldType; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'status', label: '状态标签' },
  { value: 'datetime', label: '日期时间' },
  { value: 'amount', label: '金额' },
  { value: 'link', label: '链接' },
];

export const DESIGN_SECTIONS: { id: DesignSection; label: string; hint: string }[] = [
  { id: 'basic', label: '基础信息', hint: '模块名称与业务域' },
  { id: 'filters', label: '检索条件', hint: '输入方式与数据来源' },
  { id: 'toolbar', label: '主要按钮', hint: '工具栏按钮与触发逻辑' },
  { id: 'columns', label: '列表属性', hint: '表格列与展示规则' },
  { id: 'rowActions', label: '行内操作', hint: '行按钮与显示条件' },
];
