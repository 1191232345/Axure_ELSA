import { useMemo, useState } from 'react';
import { Button } from 'animal-island-ui';
import type { ChatMessage, PrototypeEditPendingState } from '../types/chat';
import { resolvePreviewUrl } from '../services/prototypeApi';
import './EditPendingBar.css';

interface EditPendingBarProps {
  editState: PrototypeEditPendingState | null | undefined;
  messages: ChatMessage[];
  loading?: boolean;
  onConfirmAll: (pending: PrototypeEditPendingState) => void;
  onCancelAll: (pending: PrototypeEditPendingState) => void;
}

function collectUnresolvedPending(
  editState: PrototypeEditPendingState | null | undefined,
  messages: ChatMessage[],
): PrototypeEditPendingState | null {
  if (editState?.editId && editState.pageId) {
    return editState;
  }

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const pending = messages[i].prototypeEditPending;
    if (pending?.editId && pending.pageId && !messages[i].prototypeEditResolved) {
      return pending;
    }
  }
  return null;
}

export function EditPendingBar({
  editState,
  messages,
  loading = false,
  onConfirmAll,
  onCancelAll,
}: EditPendingBarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pending = useMemo(() => collectUnresolvedPending(editState, messages), [editState, messages]);

  const unresolvedCount = useMemo(() => {
    if (!pending?.editId) return 0;
    return messages.filter(
      (m) => m.prototypeEditPending?.editId === pending.editId && !m.prototypeEditResolved,
    ).length;
  }, [messages, pending?.editId]);

  if (!pending?.editId || !pending.pageId || !pending.previewUrl) {
    return null;
  }

  const previewUrl = resolvePreviewUrl(pending.previewUrl);
  const revision = pending.revision ?? 1;
  const instructions = pending.instructions ?? (pending.instruction ? [pending.instruction] : []);

  if (collapsed) {
    return (
      <div className="edit-pending-bar edit-pending-bar--collapsed">
        <button
          type="button"
          className="edit-pending-bar__toggle"
          onClick={() => setCollapsed(false)}
        >
          <span className="edit-pending-bar__badge">{revision > 1 ? `${revision} 轮修改` : '待确认'}</span>
          <span className="edit-pending-bar__hint">
            {pending.moduleName ?? pending.pageId} · 点击展开操作
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="edit-pending-bar">
      <div className="edit-pending-bar__header">
        <div className="edit-pending-bar__title">
          <span className="edit-pending-bar__label">原型草稿待确认</span>
          {revision > 1 && <span className="edit-pending-bar__revision">第 {revision} 轮</span>}
        </div>
        <button
          type="button"
          className="edit-pending-bar__collapse"
          onClick={() => setCollapsed(true)}
          aria-label="收纳"
        >
          收纳
        </button>
      </div>

      <p className="edit-pending-bar__meta">
        <strong>{pending.moduleName ?? pending.pageId}</strong>
        {unresolvedCount > 1 ? ` · ${unresolvedCount} 条修改记录` : null}
      </p>

      {pending.summary && <p className="edit-pending-bar__summary">{pending.summary}</p>}

      {instructions.length > 1 && (
        <ol className="edit-pending-bar__history">
          {instructions.map((text, idx) => (
            <li key={`${idx}-${text.slice(0, 24)}`}>{text}</li>
          ))}
        </ol>
      )}

      <code className="edit-pending-bar__path">{previewUrl}</code>

      <div className="edit-pending-bar__actions">
        <Button
          type="default"
          size="small"
          disabled={loading}
          onClick={() => window.open(previewUrl, '_blank')}
        >
          预览草稿
        </Button>
        <Button
          type="primary"
          size="small"
          disabled={loading}
          onClick={() => onConfirmAll(pending)}
        >
          {loading ? '处理中…' : '全部确认'}
        </Button>
        <Button
          type="default"
          size="small"
          disabled={loading}
          onClick={() => onCancelAll(pending)}
        >
          全部取消
        </Button>
      </div>
    </div>
  );
}
