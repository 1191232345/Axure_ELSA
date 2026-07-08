import { Title } from 'animal-island-ui';
import type { useChat } from '../hooks/useChat';
import { ContextPanel } from './ContextPanel';
import { EditPendingBar } from './EditPendingBar';
import { InputBar } from './InputBar';
import { MessageList } from './MessageList';
import { SessionSidebar } from './SessionSidebar';
import './ChatPage.css';

type ChatController = ReturnType<typeof useChat>;

interface ChatPageProps {
  chat: ChatController;
  onOpenSettings: () => void;
  onOpenKnowledge: () => void;
  onOpenPrototypePreview: (focusPageId?: string) => void;
  onOpenPrototypeDesign: () => void;
  onOpenTemplateManage: () => void;
}

export function ChatPage({
  chat,
  onOpenSettings,
  onOpenKnowledge,
  onOpenPrototypePreview,
  onOpenPrototypeDesign,
  onOpenTemplateManage,
}: ChatPageProps) {
  const {
    sessions,
    activeSession,
    activeId,
    isGenerating,
    showContext,
    setShowContext,
    triggerPrototypePreview,
    sendMessage,
    confirmAllPrototypeEdits,
    cancelAllPrototypeEdits,
    editActionLoading,
    newSession,
    selectSession,
    deleteSession,
  } = chat;

  const hasContext = Boolean(activeSession?.summary || activeSession?.userProfile);

  return (
    <>
      <SessionSidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={selectSession}
        onNew={newSession}
        onDelete={deleteSession}
      />
      <main className="chat-main">
        <header className="chat-header">
          <Title size="middle" color="app-teal">
            对话助手 🏝
          </Title>
          <div className="chat-header__actions">
            <span className="chat-header__badge">对话 · 知识库 · 原型</span>
            <button type="button" className="chat-header__settings" onClick={triggerPrototypePreview}>
              📐 原型预览
            </button>
            <button type="button" className="chat-header__settings" onClick={onOpenPrototypeDesign}>
              ✏️ 新建原型
            </button>
            <button type="button" className="chat-header__settings" onClick={onOpenTemplateManage}>
              📋 模板管理
            </button>
            <button
              type="button"
              className={`chat-header__settings${showContext ? ' chat-header__settings--active' : ''}`}
              onClick={() => setShowContext((v) => !v)}
            >
              🧠 上下文
            </button>
            <button type="button" className="chat-header__settings" onClick={onOpenKnowledge}>
              📚 知识库
            </button>
            <button type="button" className="chat-header__settings" onClick={onOpenSettings}>
              ⚙️ 配置
            </button>
          </div>
        </header>
        {showContext && (
          <ContextPanel
            summary={activeSession?.summary}
            userProfile={activeSession?.userProfile}
            hasContext={hasContext}
          />
        )}
        <MessageList
          messages={activeSession?.messages ?? []}
          isGenerating={isGenerating}
          onExampleSelect={sendMessage}
          onOpenPrototypePreview={onOpenPrototypePreview}
        />
        <EditPendingBar
          editState={activeSession?.prototypeEditState}
          messages={activeSession?.messages ?? []}
          loading={editActionLoading}
          onConfirmAll={(pending) => void confirmAllPrototypeEdits(pending)}
          onCancelAll={(pending) => void cancelAllPrototypeEdits(pending)}
        />
        <InputBar onSend={sendMessage} disabled={isGenerating || editActionLoading} />
      </main>
    </>
  );
}
