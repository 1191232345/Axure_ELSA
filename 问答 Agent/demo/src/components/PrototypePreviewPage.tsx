import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Title } from 'animal-island-ui';
import { fetchPrototypes, resolvePreviewUrl } from '../services/prototypeApi';
import type { PrototypeArchiveItem } from '../types/chat';
import { BackToChatButton } from './BackToChatButton';
import './PrototypePreviewPage.css';

interface PrototypePreviewPageProps {
  focusPageId?: string;
  onBack: () => void;
}

function formatTime(ts?: string) {
  if (!ts) return '';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts.slice(0, 19).replace('T', ' ') : d.toLocaleString('zh-CN', { hour12: false });
}

export function PrototypePreviewPage({ focusPageId, onBack }: PrototypePreviewPageProps) {
  const [items, setItems] = useState<PrototypeArchiveItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reloadItems = useCallback(async () => {
    const data = await fetchPrototypes();
    setItems(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const data = await reloadItems();
        if (cancelled) return;
        const preferred = focusPageId && data.some((item) => item.pageId === focusPageId)
          ? focusPageId
          : data[0]?.pageId;
        setSelectedId(preferred);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载归档原型失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focusPageId, reloadItems]);

  const selected = useMemo(
    () => items.find((item) => item.pageId === selectedId) ?? items[0],
    [items, selectedId],
  );

  const iframeSrc = selected ? resolvePreviewUrl(selected.previewUrl) : '';

  return (
    <div className="proto-page">
      <aside className="proto-sidebar">
        <div className="proto-sidebar__head">
          <Title size="small" color="app-teal">
            原型归档
          </Title>
          <span className="proto-sidebar__count">{items.length} 个</span>
        </div>
        {loading && <p className="proto-sidebar__hint">正在加载…</p>}
        {error && <p className="proto-sidebar__error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="proto-sidebar__hint">暂无归档原型。点击 **✏️ 新建原型** 或在对话中说「新建列表页原型」开始创建。</p>
        )}
        {!loading && items.length > 0 && (
          <ul className="proto-sidebar__list">
            {items.map((item) => {
              const active = item.pageId === selected?.pageId;
              return (
                <li key={item.pageId}>
                  <button
                    type="button"
                    className={`proto-sidebar__item${active ? ' proto-sidebar__item--active' : ''}`}
                    onClick={() => setSelectedId(item.pageId)}
                  >
                    <span className="proto-sidebar__item-name">{item.moduleName}</span>
                    {item.breadcrumb && (
                      <span className="proto-sidebar__item-domain">{item.breadcrumb}</span>
                    )}
                    {item.updatedAt && (
                      <span className="proto-sidebar__item-time">{formatTime(item.updatedAt)}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      <main className="proto-main">
        <header className="proto-main__head">
          <div className="proto-main__info">
            <div className="proto-main__title-wrap">
              <h2 className="proto-main__title">{selected?.moduleName ?? '原型预览'}</h2>
              {selected?.breadcrumb && (
                <span className="proto-main__breadcrumb">{selected.breadcrumb}</span>
              )}
            </div>
            {selected && (
              <div className="proto-main__tags">
                <span className="proto-tag">
                  ID: <code>{selected.pageId}</code>
                </span>
                {selected.updatedAt && (
                  <span className="proto-tag">{formatTime(selected.updatedAt)}</span>
                )}
              </div>
            )}
          </div>
          <div className="proto-main__actions">
            {iframeSrc && (
              <Button type="default" size="small" onClick={() => window.open(iframeSrc, '_blank')}>
                新窗口打开
              </Button>
            )}
            <BackToChatButton onClick={onBack} />
          </div>
        </header>

        <div className="proto-main__body">
          {!loading && !error && items.length === 0 && (
            <div className="proto-main__empty">
              <p>还没有可预览的原型页面</p>
              <p className="proto-main__empty-hint">点击顶部 **✏️ 新建原型**，或在对话中说「新建列表页原型」。</p>
            </div>
          )}
          {iframeSrc && (
            <iframe
              key={iframeSrc}
              className="proto-main__frame"
              src={iframeSrc}
              title={selected?.moduleName ?? '原型预览'}
            />
          )}
        </div>
      </main>
    </div>
  );
}
