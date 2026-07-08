import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input } from 'animal-island-ui';
import {
  activateKnowledgeBase,
  createKnowledgeBase,
  deleteKnowledgeBase,
  fetchKnowledgeBase,
  fetchKnowledgeBases,
  previewChunks,
  rebuildKnowledgeBase,
  updateKnowledgeBase,
} from '../services/kbApi';
import { fetchConfig } from '../services/configApi';
import type { ChunkPreviewItem, KnowledgeBaseSummary } from '../types/kb';
import { BackToChatButton } from './BackToChatButton';
import { RecallTestModal } from './RecallTestModal';
import './KnowledgeBasePage.css';

interface KnowledgeBasePageProps {
  onBack: () => void;
}

type WorkspaceTab = 'edit' | 'preview';

function formatTime(ts?: string | null) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString('zh-CN', { hour12: false });
}

export function KnowledgeBasePage({ onBack }: KnowledgeBasePageProps) {
  const [items, setItems] = useState<KnowledgeBaseSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [chunkSize, setChunkSize] = useState(400);
  const [chunkOverlap, setChunkOverlap] = useState(80);
  const [indexReady, setIndexReady] = useState(false);
  const [indexedChunks, setIndexedChunks] = useState(0);
  const [indexBuiltAt, setIndexBuiltAt] = useState<string | null>(null);
  const [preview, setPreview] = useState<ChunkPreviewItem[]>([]);
  const [previewTitle, setPreviewTitle] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [embedModel, setEmbedModel] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<WorkspaceTab>('edit');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const previewTimer = useRef<number | null>(null);
  const autoSaveTimer = useRef<number | null>(null);
  const skipAutoSaveRef = useRef(true);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [expandedChunk, setExpandedChunk] = useState<number | null>(null);

  const buildSnapshot = useCallback(
    (fields: {
      name: string;
      description: string;
      content: string;
      chunkSize: number;
      chunkOverlap: number;
    }) =>
      JSON.stringify({
        name: fields.name.trim(),
        description: fields.description.trim(),
        content: fields.content,
        chunkSize: fields.chunkSize,
        chunkOverlap: fields.chunkOverlap,
      }),
    [],
  );

  const loadList = useCallback(async () => {
    const data = await fetchKnowledgeBases();
    setItems(data.items);
    return data;
  }, []);

  const applyPreview = useCallback((result: { title: string; chunks: ChunkPreviewItem[] }) => {
    setPreviewTitle(result.title);
    setPreview(result.chunks);
  }, []);

  const applyDetail = useCallback(
    (detail: Awaited<ReturnType<typeof fetchKnowledgeBase>>) => {
      setSelectedId(detail.id);
      setName(detail.name);
      setDescription(detail.description);
      setContent(detail.content);
      setChunkSize(detail.chunkSize);
      setChunkOverlap(detail.chunkOverlap);
      setIndexReady(detail.indexReady);
      setIndexedChunks(detail.chunks);
      setIndexBuiltAt(detail.indexBuiltAt ?? null);
      setSavedSnapshot(
        buildSnapshot({
          name: detail.name,
          description: detail.description,
          content: detail.content,
          chunkSize: detail.chunkSize,
          chunkOverlap: detail.chunkOverlap,
        }),
      );
    },
    [buildSnapshot],
  );

  const loadDetail = useCallback(
    async (id: string) => {
      skipAutoSaveRef.current = true;
      const detail = await fetchKnowledgeBase(id);
      applyDetail(detail);
      setExpandedChunk(null);
      skipAutoSaveRef.current = false;
      return detail;
    },
    [applyDetail],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await fetchConfig();
        if (!cancelled) setEmbedModel(config.embedModel);
      } catch {
        /* 索引栏仍可展示本库状态 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadList();
        if (cancelled) return;
        const firstId = data.activeId || data.items[0]?.id;
        if (firstId) {
          setDetailLoading(true);
          await loadDetail(firstId);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        if (!cancelled) {
          setListLoading(false);
          setDetailLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDetail, loadList]);

  const runLivePreview = useCallback(
    async (text: string, size: number, overlap: number, title: string) => {
      if (!text.trim()) {
        setPreview([]);
        setPreviewTitle('');
        return;
      }
      setPreviewing(true);
      try {
        const result = await previewChunks({
          content: text,
          title,
          chunkSize: size,
          chunkOverlap: overlap,
        });
        applyPreview(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '分块预览失败');
      } finally {
        setPreviewing(false);
      }
    },
    [applyPreview],
  );

  useEffect(() => {
    if (!selectedId || detailLoading) return;
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      void runLivePreview(content, chunkSize, chunkOverlap, name);
    }, 400);
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, [chunkOverlap, chunkSize, content, detailLoading, name, runLivePreview, selectedId]);

  const persistSave = useCallback(
    async (silent = false) => {
      if (!selectedId) return false;
      const snapshot = buildSnapshot({ name, description, content, chunkSize, chunkOverlap });
      if (snapshot === savedSnapshot) return true;
      setSaving(true);
      if (!silent) {
        setError('');
        setMessage('');
      }
      try {
        const saved = await updateKnowledgeBase(selectedId, {
          name: name.trim(),
          description: description.trim(),
          content,
          chunkSize,
          chunkOverlap,
        });
        const next = buildSnapshot({
          name: saved.name,
          description: saved.description,
          content: saved.content,
          chunkSize: saved.chunkSize,
          chunkOverlap: saved.chunkOverlap,
        });
        setSavedSnapshot(next);
        setIndexReady(saved.indexReady);
        setIndexedChunks(saved.chunks);
        setIndexBuiltAt(saved.indexBuiltAt ?? null);
        await loadList();
        if (!silent) setMessage('已保存');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : silent ? '自动保存失败' : '保存失败');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [buildSnapshot, chunkOverlap, chunkSize, content, description, loadList, name, savedSnapshot, selectedId],
  );

  useEffect(() => {
    if (!selectedId || detailLoading || skipAutoSaveRef.current || saving || rebuilding || creating) {
      return;
    }
    const snapshot = buildSnapshot({ name, description, content, chunkSize, chunkOverlap });
    if (snapshot === savedSnapshot) return;

    if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = window.setTimeout(() => {
      void persistSave(true);
    }, 1500);

    return () => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [
    buildSnapshot,
    chunkOverlap,
    chunkSize,
    content,
    creating,
    description,
    detailLoading,
    name,
    persistSave,
    rebuilding,
    savedSnapshot,
    saving,
    selectedId,
  ]);

  const onSelect = async (id: string) => {
    if (id === selectedId) return;
    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    const snapshot = buildSnapshot({ name, description, content, chunkSize, chunkOverlap });
    if (snapshot !== savedSnapshot) {
      await persistSave(true);
    }
    setDetailLoading(true);
    setError('');
    setMessage('');
    try {
      await loadDetail(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载知识库失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const onCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('请输入知识库名称');
      return;
    }
    setCreating(true);
    setError('');
    setMessage('');
    try {
      const created = await createKnowledgeBase(trimmed);
      const data = await loadList();
      setItems(data.items);
      await loadDetail(created.id);
      setNewName('');
      setMessage(`已创建「${created.name}」`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const onRebuild = async () => {
    if (!selectedId) return;
    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    setRebuilding(true);
    setError('');
    setMessage('');
    try {
      await updateKnowledgeBase(selectedId, {
        name: name.trim(),
        description: description.trim(),
        content,
        chunkSize,
        chunkOverlap,
      });
      const next = buildSnapshot({ name, description, content, chunkSize, chunkOverlap });
      setSavedSnapshot(next);
      const result = await rebuildKnowledgeBase(selectedId);
      await loadDetail(selectedId);
      await loadList();
      setMessage(result.message ?? '索引构建完成');
    } catch (err) {
      setError(err instanceof Error ? err.message : '索引构建失败');
    } finally {
      setRebuilding(false);
    }
  };

  const onActivate = async () => {
    if (!selectedId) return;
    setError('');
    setMessage('');
    try {
      await activateKnowledgeBase(selectedId);
      await loadList();
      setMessage('已设为聊天使用的 RAG 库');
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换失败');
    }
  };

  const onDelete = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`确定删除「${target.name}」？此操作不可恢复。`)) return;
    setError('');
    setMessage('');
    try {
      const result = await deleteKnowledgeBase(id);
      const data = await loadList();
      const nextId = data.items.find((item) => item.id === result.activeId)?.id ?? data.items[0]?.id;
      if (nextId) {
        setDetailLoading(true);
        await loadDetail(nextId);
        setDetailLoading(false);
      } else {
        setSelectedId('');
      }
      setMessage('已删除');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const selected = items.find((item) => item.id === selectedId);
  const previewCount = preview.length;
  const avgChars =
    previewCount > 0 ? Math.round(preview.reduce((sum, c) => sum + c.chars, 0) / previewCount) : 0;
  const busy = detailLoading || saving || rebuilding || creating;
  const isDirty =
    selectedId &&
    buildSnapshot({ name, description, content, chunkSize, chunkOverlap }) !== savedSnapshot;

  const previewGroups = preview.reduce<{ docTitle: string; chunks: ChunkPreviewItem[] }[]>(
    (groups, chunk) => {
      const docTitle = chunk.docTitle || previewTitle || '未命名';
      const last = groups[groups.length - 1];
      if (last && last.docTitle === docTitle) {
        last.chunks.push(chunk);
      } else {
        groups.push({ docTitle, chunks: [chunk] });
      }
      return groups;
    },
    [],
  );

  return (
    <div className="kb-page">
      {/* ── 左侧：库列表 ── */}
      <aside className="kb-sidebar">
        <div className="kb-sidebar__head">
          <span className="kb-sidebar__title">知识库</span>
        </div>

        <div className="kb-sidebar__create">
          <input
            className="kb-sidebar__input"
            value={newName}
            placeholder="新建库名称…"
            disabled={creating}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onCreate();
            }}
          />
          <button
            type="button"
            className="kb-sidebar__add"
            disabled={creating}
            onClick={() => void onCreate()}
          >
            {creating ? '…' : '+'}
          </button>
        </div>

        <ul className="kb-sidebar__list">
          {listLoading && <li className="kb-sidebar__empty">加载中…</li>}
          {!listLoading && items.length === 0 && (
            <li className="kb-sidebar__empty">暂无知识库</li>
          )}
          {items.map((item) => (
            <li key={item.id} className="kb-lib-wrap">
              <button
                type="button"
                className={`kb-lib${item.id === selectedId ? ' kb-lib--active' : ''}`}
                onClick={() => void onSelect(item.id)}
              >
                <span className="kb-lib__row">
                  <span className="kb-lib__name">{item.name}</span>
                  {item.active && <span className="kb-lib__dot" title="聊天使用中" />}
                </span>
                <span className="kb-lib__meta">
                  {item.indexReady ? `${item.chunks} 块已索引` : '未索引'}
                </span>
              </button>
              {items.length > 1 && (
                <button
                  type="button"
                  className="kb-lib__del"
                  aria-label={`删除「${item.name}」`}
                  onClick={() => void onDelete(item.id)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* ── 主工作区 ── */}
      <div className="kb-main">
        {!selectedId && !listLoading ? (
          <>
            <header className="kb-header kb-header--minimal">
              <BackToChatButton onClick={onBack} />
            </header>
            <div className="kb-main__empty">请选择或新建一个知识库</div>
          </>
        ) : (
          <>
            {/* 顶栏：状态 + 操作 */}
            <header className="kb-header">
              <div className="kb-header__info">
                <div className="kb-header__title-row">
                  <h1 className="kb-header__title">{detailLoading ? '加载中…' : name || '未命名'}</h1>
                  <button
                    type="button"
                    className={`kb-header__settings${showSettings ? ' kb-header__settings--on' : ''}`}
                    disabled={detailLoading}
                    aria-label="库设置"
                    title="库设置"
                    onClick={() => setShowSettings((v) => !v)}
                  >
                    ⚙️
                  </button>
                </div>
                <div className="kb-header__tags">
                  {selected?.active && <span className="kb-tag kb-tag--live">使用中</span>}
                  {saving && <span className="kb-tag kb-tag--sync">保存中…</span>}
                  {!saving && isDirty && <span className="kb-tag kb-tag--dirty">未保存</span>}
                  {!saving && !isDirty && selectedId && !detailLoading && (
                    <span className="kb-tag kb-tag--saved">已保存</span>
                  )}
                  <span className="kb-tag">{content.length.toLocaleString()} 字</span>
                  <span className={`kb-tag${indexReady ? ' kb-tag--ok' : ''}`}>
                    {indexReady ? `${indexedChunks} 块已索引` : '未构建索引'}
                  </span>
                </div>
              </div>

              <div className="kb-header__actions">
                <Button
                  type="default"
                  size="small"
                  disabled={!selectedId || detailLoading}
                  onClick={() => setShowRecallModal(true)}
                >
                  召回测试
                </Button>
                <Button type="primary" size="small" disabled={rebuilding || busy} onClick={() => void onRebuild()}>
                  {rebuilding ? '处理中…' : '构建索引'}
                </Button>
                {!selected?.active && (
                  <Button type="default" size="small" disabled={busy} onClick={() => void onActivate()}>
                    设为使用中
                  </Button>
                )}
                <BackToChatButton onClick={onBack} />
              </div>
            </header>

            <div className="kb-index-bar">
              <div className="kb-index-bar__info">
                <span className="kb-index-bar__label">向量索引</span>
                <span className="kb-index-bar__item">
                  Embedding：<code>{embedModel || '—'}</code>
                </span>
                <span className="kb-index-bar__dot">·</span>
                <span className="kb-index-bar__item">
                  本库：{indexReady ? `${indexedChunks} 块` : '未构建'}
                  {indexBuiltAt ? ` · ${formatTime(indexBuiltAt)}` : ''}
                </span>
              </div>
            </div>

            {/* 可折叠设置面板 */}
            {showSettings && !detailLoading && (
              <div className="kb-settings">
                <div className="kb-settings__field">
                  <label htmlFor="kb-name">名称</label>
                  <Input
                    id="kb-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="kb-settings__field">
                  <label htmlFor="kb-desc">描述（意图路由范围）</label>
                  <Input
                    id="kb-desc"
                    value={description}
                    placeholder="如：美国仓入库截单、计费规则"
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                  />
                </div>
                <div className="kb-settings__field kb-settings__field--sm">
                  <label htmlFor="kb-chunk-size">分块大小</label>
                  <Input
                    id="kb-chunk-size"
                    type="number"
                    min={100}
                    max={2000}
                    value={String(chunkSize)}
                    onChange={(e) => {
                      setChunkSize(Number(e.target.value));
                    }}
                  />
                </div>
                <div className="kb-settings__field kb-settings__field--sm">
                  <label htmlFor="kb-chunk-overlap">重叠字符</label>
                  <Input
                    id="kb-chunk-overlap"
                    type="number"
                    min={0}
                    max={500}
                    value={String(chunkOverlap)}
                    onChange={(e) => {
                      setChunkOverlap(Number(e.target.value));
                    }}
                  />
                </div>
                <div className="kb-settings__meta">
                  <span>ID: {selectedId}</span>
                  <span>
                    索引：{indexReady ? `${indexedChunks} 块` : '未构建'}
                    {indexBuiltAt ? ` · ${formatTime(indexBuiltAt)}` : ''}
                  </span>
                  {embedModel && <span>Embedding：{embedModel}</span>}
                </div>
                <p className="kb-settings__hint">
                  修改 ⚙️ 配置中的 Embedding 模型后，旧索引会失效，请使用上方「构建索引」重新生成。
                </p>
              </div>
            )}

            {/* 反馈条 */}
            {(message || error) && (
              <div className={`kb-toast${error ? ' kb-toast--error' : ''}`}>{error || message}</div>
            )}

            {/* 工作区 Tab */}
            <div className="kb-tabs">
              <button
                type="button"
                className={`kb-tabs__btn${mobileTab === 'edit' ? ' kb-tabs__btn--active' : ''}`}
                onClick={() => setMobileTab('edit')}
              >
                编辑
              </button>
              <button
                type="button"
                className={`kb-tabs__btn${mobileTab === 'preview' ? ' kb-tabs__btn--active' : ''}`}
                onClick={() => setMobileTab('preview')}
              >
                分块预览{previewCount > 0 ? ` (${previewCount})` : ''}
              </button>
            </div>

            {/* 编辑 + 预览双栏 */}
            <div className="kb-panes">
              <section className={`kb-pane kb-pane--edit${mobileTab === 'edit' ? ' kb-pane--show' : ''}`}>
                <textarea
                  className="kb-editor"
                  value={content}
                  disabled={detailLoading}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setExpandedChunk(null);
                  }}
                  placeholder={'# 文档标题\n\n## 章节\n\n在此编写 Markdown 内容…'}
                  spellCheck={false}
                />
              </section>

              <section className={`kb-pane kb-pane--preview${mobileTab === 'preview' ? ' kb-pane--show' : ''}`}>
                <div className="kb-preview-bar">
                  <div className="kb-preview-bar__left">
                    <span className="kb-preview-bar__label">分块预览</span>
                    {previewing && <span className="kb-preview-bar__sync">同步中</span>}
                  </div>
                  {previewCount > 0 && (
                    <div className="kb-preview-bar__stats">
                      <span>{previewCount} 块</span>
                      <span className="kb-preview-bar__dot">·</span>
                      <span>均 {avgChars} 字</span>
                      <span className="kb-preview-bar__dot">·</span>
                      <span>上限 {chunkSize}</span>
                    </div>
                  )}
                </div>
                <div className="kb-preview-list">
                  {detailLoading ? (
                    <p className="kb-preview-empty">加载中…</p>
                  ) : previewCount === 0 ? (
                    <p className="kb-preview-empty">
                      在左侧输入 Markdown，分块结果将实时显示于此。
                      <br />
                      <code className="kb-preview-hint"># 标题</code> 分文档，<code className="kb-preview-hint">## 章节</code> 分节。
                    </p>
                  ) : (
                    previewGroups.map((group) => (
                      <div key={group.docTitle} className="kb-doc-group">
                        {previewGroups.length > 1 && (
                          <h3 className="kb-doc-group__title">{group.docTitle}</h3>
                        )}
                        {group.chunks.map((chunk) => {
                          const expanded = expandedChunk === chunk.index;
                          const fillPct = Math.min(100, Math.round((chunk.chars / chunkSize) * 100));
                          const overLimit = chunk.chars > chunkSize;
                          return (
                            <article
                              key={chunk.index}
                              className={`kb-chunk${expanded ? ' kb-chunk--expanded' : ''}`}
                            >
                              <button
                                type="button"
                                className="kb-chunk__head"
                                onClick={() =>
                                  setExpandedChunk(expanded ? null : chunk.index)
                                }
                              >
                                <span className="kb-chunk__idx">{chunk.index}</span>
                                <span className="kb-chunk__section">{chunk.section || '概述'}</span>
                                <span className={`kb-chunk__len${overLimit ? ' kb-chunk__len--warn' : ''}`}>
                                  {chunk.chars} 字
                                </span>
                                <span className="kb-chunk__toggle">{expanded ? '▲' : '▼'}</span>
                              </button>
                              <div className="kb-chunk__meter" aria-hidden>
                                <div
                                  className={`kb-chunk__meter-fill${overLimit ? ' kb-chunk__meter-fill--warn' : ''}`}
                                  style={{ width: `${fillPct}%` }}
                                />
                              </div>
                              {!expanded && (
                                <p className="kb-chunk__snippet">
                                  {chunk.text.replace(/\s+/g, ' ').slice(0, 100)}
                                  {chunk.text.length > 100 ? '…' : ''}
                                </p>
                              )}
                              <pre className="kb-chunk__body">{chunk.text}</pre>
                            </article>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <RecallTestModal
              open={showRecallModal}
              kbId={selectedId}
              kbName={name || '未命名'}
              indexReady={indexReady}
              onClose={() => setShowRecallModal(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
