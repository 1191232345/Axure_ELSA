import './ContextPanel.css';

interface ContextPanelProps {
  summary?: string;
  userProfile?: string;
  hasContext: boolean;
}

export function ContextPanel({ summary, userProfile, hasContext }: ContextPanelProps) {
  return (
    <aside className="context-panel">
      <div className="context-panel__item">
        <span className="context-panel__label">会话摘要</span>
        <p>{summary?.trim() || '多轮对话后将自动生成摘要，补充滑动窗口外的记忆。'}</p>
      </div>
      <div className="context-panel__item">
        <span className="context-panel__label">用户画像</span>
        <p>{userProfile?.trim() || '将从对话中提取关注区域、角色与提问偏好。'}</p>
      </div>
      {!hasContext && (
        <p className="context-panel__hint">摘要与画像在每轮回答后由模型自动更新，并注入检索与生成。</p>
      )}
    </aside>
  );
}
