import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Title } from 'animal-island-ui';
import {
  createPrototypeTemplate,
  deletePrototypeTemplate,
  duplicatePrototypeTemplate,
  fetchPrototypeTemplate,
  fetchPrototypeTemplates,
  updatePrototypeTemplate,
} from '../services/templateApi';
import type { DesignSection, PrototypeDesign } from '../types/prototypeDesign';
import { DESIGN_SECTIONS } from '../types/prototypeDesign';
import type { PrototypeTemplateSummary } from '../types/prototypeTemplate';
import { BackToChatButton } from './BackToChatButton';
import { DesignConfigPanel } from './DesignConfigPanel';
import './PrototypeDesignPage.css';
import './TemplateManagePage.css';

interface TemplateManagePageProps {
  onBack: () => void;
}

function formatTime(ts?: string | null) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString('zh-CN', { hour12: false });
}

export function TemplateManagePage({ onBack }: TemplateManagePageProps) {
  const [items, setItems] = useState<PrototypeTemplateSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [section, setSection] = useState<DesignSection>('basic');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [design, setDesign] = useState<PrototypeDesign | null>(null);
  const [system, setSystem] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = useMemo(() => items.find((i) => i.id === selectedId), [items, selectedId]);
  const currentSection = DESIGN_SECTIONS.find((s) => s.id === section);
  const readOnly = system;

  const loadList = useCallback(async () => {
    const list = await fetchPrototypeTemplates();
    setItems(list);
    return list;
  }, []);

  const loadDetail = useCallback(async (templateId: string) => {
    setDetailLoading(true);
    setError('');
    try {
      const detail = await fetchPrototypeTemplate(templateId);
      setSelectedId(detail.id);
      setName(detail.name);
      setDescription(detail.description);
      setDesign(detail.design);
      setSystem(detail.system);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载模板失败');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setListLoading(true);
      setError('');
      try {
        const list = await loadList();
        if (list.length > 0) {
          await loadDetail(list[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载模板列表失败');
      } finally {
        setListLoading(false);
      }
    })();
  }, [loadDetail, loadList]);

  const onSelect = (templateId: string) => {
    if (templateId === selectedId) return;
    void loadDetail(templateId);
  };

  const onSave = async () => {
    if (!selectedId || !design || readOnly) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await updatePrototypeTemplate(selectedId, {
        name: name.trim(),
        description: description.trim(),
        design,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                system: updated.system,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
              }
            : item,
        ),
      );
      setMessage('模板已保存');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('请填写新模板名称');
      return;
    }
    setCreating(true);
    setError('');
    setMessage('');
    try {
      const created = await createPrototypeTemplate(trimmed, '');
      setNewName('');
      const list = await loadList();
      void list;
      await loadDetail(created.id);
      setMessage(`已创建模板「${created.name}」`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const onDuplicate = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const copy = await duplicatePrototypeTemplate(selectedId);
      await loadList();
      await loadDetail(copy.id);
      setMessage(`已复制为「${copy.name}」`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制失败');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedId || readOnly) return;
    if (!window.confirm(`确定删除模板「${name}」？此操作不可恢复。`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await deletePrototypeTemplate(selectedId);
      const list = await loadList();
      if (list.length > 0) {
        await loadDetail(list[0].id);
      } else {
        setSelectedId('');
        setDesign(null);
      }
      setMessage('模板已删除');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tpl-page">
      <aside className="tpl-sidebar">
        <div className="tpl-sidebar__head">
          <Title size="small" color="app-teal">
            原型模板
          </Title>
          <p className="tpl-sidebar__hint">维护检索、按钮、列等默认配置</p>
        </div>

        <div className="tpl-sidebar__create">
          <Input value={newName} placeholder="新模板名称" onChange={(e) => setNewName(e.target.value)} />
          <Button type="primary" size="small" disabled={creating} onClick={() => void onCreate()}>
            {creating ? '创建中…' : '新建'}
          </Button>
        </div>

        <div className="tpl-sidebar__list">
          {listLoading && <p className="tpl-sidebar__empty">加载中…</p>}
          {!listLoading &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tpl-sidebar__item${item.id === selectedId ? ' tpl-sidebar__item--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <span className="tpl-sidebar__item-name">{item.name}</span>
                {item.system && <span className="tpl-sidebar__badge">内置</span>}
                <span className="tpl-sidebar__item-desc">{item.description || item.id}</span>
              </button>
            ))}
        </div>
      </aside>

      <div className="design-main tpl-main">
        <header className="design-header">
          <div className="design-header__info">
            <h1 className="design-header__title">{selected?.name ?? '模板管理'}</h1>
            <p className="design-header__desc">
              {readOnly
                ? '系统内置模板只读，可复制后编辑'
                : currentSection?.hint ?? '配置模板的默认结构与字段'}
            </p>
          </div>
          <div className="design-header__actions">
            <Button type="default" size="small" disabled={!selectedId || saving} onClick={() => void onDuplicate()}>
              复制模板
            </Button>
            {!readOnly && (
              <>
                <Button type="primary" size="small" disabled={!design || saving} onClick={() => void onSave()}>
                  {saving ? '保存中…' : '保存模板'}
                </Button>
                <Button type="default" size="small" disabled={saving} onClick={() => void onDelete()}>
                  删除
                </Button>
              </>
            )}
            <BackToChatButton onClick={onBack} />
          </div>
        </header>

        {message && <p className="design-banner design-banner--ok">{message}</p>}
        {error && <p className="design-banner design-banner--err">{error}</p>}

        {selectedId && (
          <div className="tpl-meta">
            <label className="design-field">
              <span className="design-field__label">模板名称</span>
              <Input value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="design-field design-field--full">
              <span className="design-field__label">说明</span>
              <Input
                value={description}
                disabled={readOnly}
                placeholder="模板用途说明"
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <p className="tpl-meta__foot">
              ID: <code>{selectedId}</code>
              {selected?.updatedAt ? ` · 更新于 ${formatTime(selected.updatedAt)}` : null}
            </p>
          </div>
        )}

        <div className="design-page tpl-editor">
          <aside className="design-sidebar tpl-editor__nav">
            <nav className="design-sidebar__nav">
              {DESIGN_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`design-sidebar__tab${section === item.id ? ' design-sidebar__tab--active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  <span className="design-sidebar__tab-label">{item.label}</span>
                  <span className="design-sidebar__tab-hint">{item.hint}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="design-body tpl-editor__body">
            {detailLoading && <p className="design-loading">正在加载模板…</p>}
            {!detailLoading && design && (
              <DesignConfigPanel
                design={design}
                section={section}
                mode="template"
                readOnly={readOnly}
                onChange={setDesign}
              />
            )}
            {!detailLoading && !design && !listLoading && (
              <p className="design-loading">请选择或创建一个模板</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
