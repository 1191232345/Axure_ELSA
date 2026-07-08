import { Button, Input } from 'animal-island-ui';
import type { DesignSection, PrototypeDesign } from '../types/prototypeDesign';
import { COLUMN_TYPE_OPTIONS, FILTER_INPUT_OPTIONS, TOOLBAR_VARIANT_OPTIONS } from '../types/prototypeDesign';
import {
  addDesignRow,
  emptyColumn,
  emptyFilter,
  emptyRowAction,
  emptyToolbar,
  patchDesign,
  removeDesignRow,
  updateDesignRow,
} from '../utils/designFormUtils';

interface DesignConfigPanelProps {
  design: PrototypeDesign;
  section: DesignSection;
  onChange: (design: PrototypeDesign) => void;
  /** 模板模式下基础信息作为示例字段展示 */
  mode?: 'prototype' | 'template';
  readOnly?: boolean;
}

export function DesignConfigPanel({
  design,
  section,
  onChange,
  mode = 'prototype',
  readOnly = false,
}: DesignConfigPanelProps) {
  const mutate = (next: PrototypeDesign) => {
    if (!readOnly) onChange(next);
  };
  const setPatch = (patch: Partial<PrototypeDesign>) => mutate(patchDesign(design, patch));

  if (section === 'basic') {
    return (
      <section className="design-section">
        {mode === 'template' && (
          <p className="design-section__hint">以下基础信息为模板示例，新建原型时可再修改。</p>
        )}
        <div className="design-form-grid">
          <label className="design-field">
            <span className="design-field__label">{mode === 'prototype' ? '模块名称 *' : '示例模块名'}</span>
            <Input
              value={design.moduleName}
              placeholder="例如：价卡查询"
              disabled={readOnly}
              onChange={(e) => setPatch({ moduleName: e.target.value })}
            />
          </label>
          <label className="design-field">
            <span className="design-field__label">{mode === 'prototype' ? '所属业务域 *' : '示例业务域'}</span>
            <Input
              value={design.breadcrumb}
              placeholder="例如：费用管理"
              disabled={readOnly}
              onChange={(e) => setPatch({ breadcrumb: e.target.value })}
            />
          </label>
        </div>
        <label className="design-field design-field--full">
          <span className="design-field__label">补充说明（可选）</span>
          <textarea
            className="design-textarea"
            value={design.notes}
            placeholder="全局权限、异常提示、特殊业务规则等"
            rows={4}
            disabled={readOnly}
            onChange={(e) => setPatch({ notes: e.target.value })}
          />
        </label>
      </section>
    );
  }

  if (section === 'filters') {
    return (
      <section className="design-section">
        <div className="design-section__toolbar">
          <Button
            type="default"
            size="small"
            disabled={readOnly}
            onClick={() => mutate(addDesignRow(design, 'filters', emptyFilter))}
          >
            + 添加检索项
          </Button>
        </div>
        <div className="design-table-wrap">
          <table className="design-table">
            <thead>
              <tr>
                <th>检索项名称</th>
                <th>输入方式</th>
                <th>数据来源 / 占位</th>
                <th>默认值</th>
                <th>必填</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {design.filters.length === 0 && (
                <tr>
                  <td colSpan={6} className="design-table__empty">
                    暂无检索条件，可点击「添加检索项」
                  </td>
                </tr>
              )}
              {design.filters.map((row, index) => (
                <tr key={`filter-${index}`}>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.label}
                      placeholder="状态"
                      onChange={(e) => mutate(updateDesignRow(design, 'filters', index, { label: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="design-table__select"
                      value={row.inputType}
                      onChange={(e) =>
                        mutate(
                          updateDesignRow(design, 'filters', index, {
                            inputType: e.target.value as typeof row.inputType,
                          }),
                        )
                      }
                    >
                      {FILTER_INPUT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.dataSource}
                      placeholder="全部/启用/禁用"
                      onChange={(e) => mutate(updateDesignRow(design, 'filters', index, { dataSource: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.defaultValue}
                      onChange={(e) => mutate(updateDesignRow(design, 'filters', index, { defaultValue: e.target.value }))
                      }
                    />
                  </td>
                  <td className="design-table__center">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={(e) => mutate(updateDesignRow(design, 'filters', index, { required: e.target.checked }))
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="design-table__del"
                      onClick={() => mutate(removeDesignRow(design, 'filters', index))}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (section === 'toolbar') {
    return (
      <section className="design-section">
        <div className="design-section__toolbar">
          <Button
            type="default"
            size="small"
            onClick={() => mutate(addDesignRow(design, 'toolbarButtons', emptyToolbar))}
          >
            + 添加按钮
          </Button>
        </div>
        <div className="design-table-wrap">
          <table className="design-table">
            <thead>
              <tr>
                <th>按钮名称</th>
                <th>按钮样式</th>
                <th>触发逻辑</th>
                <th>前置条件</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {design.toolbarButtons.map((row, index) => (
                <tr key={`toolbar-${index}`}>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.label}
                      placeholder="新增"
                      onChange={(e) => mutate(updateDesignRow(design, 'toolbarButtons', index, { label: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="design-table__select"
                      value={row.variant ?? ''}
                      onChange={(e) =>
                        mutate(
                          updateDesignRow(design, 'toolbarButtons', index, {
                            variant: e.target.value as typeof row.variant,
                            color: '',
                          }),
                        )
                      }
                    >
                      {TOOLBAR_VARIANT_OPTIONS.map((opt) => (
                        <option key={opt.value || 'auto'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.logic}
                      placeholder="打开表单弹窗，提交后刷新"
                      onChange={(e) => mutate(updateDesignRow(design, 'toolbarButtons', index, { logic: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.precondition}
                      placeholder="无"
                      onChange={(e) => mutate(updateDesignRow(design, 'toolbarButtons', index, { precondition: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="design-table__del"
                      onClick={() => mutate(removeDesignRow(design, 'toolbarButtons', index))}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (section === 'columns') {
    return (
      <section className="design-section">
        <div className="design-section__toolbar">
          <Button type="default" size="small" onClick={() => mutate(addDesignRow(design, 'columns', emptyColumn))}>
            + 添加列
          </Button>
        </div>
        <div className="design-table-wrap">
          <table className="design-table">
            <thead>
              <tr>
                <th>列名称 *</th>
                <th>字段类型</th>
                <th>可排序</th>
                <th>格式 / 映射</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {design.columns.map((row, index) => (
                <tr key={`column-${index}`}>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.label}
                      placeholder="价卡名称"
                      onChange={(e) => mutate(updateDesignRow(design, 'columns', index, { label: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="design-table__select"
                      value={row.fieldType}
                      onChange={(e) =>
                        mutate(
                          updateDesignRow(design, 'columns', index, {
                            fieldType: e.target.value as typeof row.fieldType,
                          }),
                        )
                      }
                    >
                      {COLUMN_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="design-table__center">
                    <input
                      type="checkbox"
                      checked={row.sortable}
                      onChange={(e) => mutate(updateDesignRow(design, 'columns', index, { sortable: e.target.checked }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="design-table__input"
                      value={row.format}
                      placeholder="启用/禁用"
                      onChange={(e) => mutate(updateDesignRow(design, 'columns', index, { format: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="design-table__del"
                      onClick={() => mutate(removeDesignRow(design, 'columns', index))}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="design-section">
      <div className="design-section__toolbar">
        <Button type="default" size="small" onClick={() => mutate(addDesignRow(design, 'rowActions', emptyRowAction))}>
          + 添加操作
        </Button>
      </div>
      <div className="design-table-wrap">
        <table className="design-table">
          <thead>
            <tr>
              <th>按钮名称</th>
              <th>触发逻辑</th>
              <th>显示条件</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {design.rowActions.map((row, index) => (
              <tr key={`row-${index}`}>
                <td>
                  <input
                    className="design-table__input"
                    value={row.label}
                    placeholder="编辑"
                    onChange={(e) => mutate(updateDesignRow(design, 'rowActions', index, { label: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="design-table__input"
                    value={row.logic}
                    placeholder="打开编辑弹窗并回填"
                    onChange={(e) => mutate(updateDesignRow(design, 'rowActions', index, { logic: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="design-table__input"
                    value={row.showCondition}
                    placeholder="无"
                    onChange={(e) => mutate(updateDesignRow(design, 'rowActions', index, { showCondition: e.target.value }))}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="design-table__del"
                    onClick={() => mutate(removeDesignRow(design, 'rowActions', index))}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
