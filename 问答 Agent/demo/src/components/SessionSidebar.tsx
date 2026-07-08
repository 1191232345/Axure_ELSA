import { Button, Title } from 'animal-island-ui';
import { canDeleteSession } from '../hooks/useChatSessions';
import type { ChatSession } from '../types/chat';
import './SessionSidebar.css';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function SessionSidebar({ sessions, activeId, onSelect, onNew, onDelete }: SessionSidebarProps) {
  return (
    <aside className="session-sidebar">
      <div className="session-sidebar__header">
        <Title size="small" color="app-teal">
          对话记录
        </Title>
        <Button type="primary" size="small" onClick={onNew}>
          ＋ 新对话
        </Button>
      </div>
      <ul className="session-sidebar__list">
        {sessions.map((s) => {
          const deletable = canDeleteSession(s, sessions);

          return (
          <li key={s.id} className="session-item-wrap">
            <button
              type="button"
              className={`session-item${s.id === activeId ? ' session-item--active' : ''}`}
              onClick={() => onSelect(s.id)}
            >
              <span className="session-item__title">{s.title}</span>
              <span className="session-item__time">{formatTime(s.updatedAt)}</span>
            </button>
            {deletable && (
              <button
                type="button"
                className="session-item__delete"
                aria-label={`删除「${s.title}」`}
                title="删除对话"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(s.id);
                }}
              >
                ×
              </button>
            )}
          </li>
          );
        })}
      </ul>
    </aside>
  );
}
