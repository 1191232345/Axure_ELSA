import { useCallback, useState } from 'react';
import { ChatPage } from './ChatPage';
import { ConfigPage } from './ConfigPage';
import { KnowledgeBasePage } from './KnowledgeBasePage';
import { PrototypeDesignPage } from './PrototypeDesignPage';
import { PrototypePreviewPage } from './PrototypePreviewPage';
import { TemplateManagePage } from './TemplateManagePage';
import { useChat } from '../hooks/useChat';
import './ChatPage.css';

type View = 'chat' | 'config' | 'knowledge' | 'prototype-preview' | 'prototype-design' | 'template-manage';

export function App() {
  const [view, setView] = useState<View>('chat');
  const [prototypeFocusPageId, setPrototypeFocusPageId] = useState<string | undefined>();

  const openPrototypePreview = useCallback((focusPageId?: string) => {
    setPrototypeFocusPageId(focusPageId);
    setView('prototype-preview');
  }, []);

  const openPrototypeDesign = useCallback(() => {
    setView('prototype-design');
  }, []);

  const openTemplateManage = useCallback(() => {
    setView('template-manage');
  }, []);

  const backToChat = useCallback(() => {
    setView('chat');
    setPrototypeFocusPageId(undefined);
  }, []);

  const chat = useChat(openPrototypePreview, openPrototypeDesign);

  return (
    <div className="chat-page">
      {view === 'chat' ? (
        <ChatPage
          chat={chat}
          onOpenSettings={() => setView('config')}
          onOpenKnowledge={() => setView('knowledge')}
          onOpenPrototypePreview={openPrototypePreview}
          onOpenPrototypeDesign={openPrototypeDesign}
          onOpenTemplateManage={openTemplateManage}
        />
      ) : view === 'knowledge' ? (
        <KnowledgeBasePage onBack={backToChat} />
      ) : view === 'prototype-preview' ? (
        <PrototypePreviewPage focusPageId={prototypeFocusPageId} onBack={backToChat} />
      ) : view === 'prototype-design' ? (
        <PrototypeDesignPage
          onBack={backToChat}
          onGenerated={(pageId) => {
            setPrototypeFocusPageId(pageId);
            setView('prototype-preview');
          }}
          onOpenTemplateManage={openTemplateManage}
        />
      ) : view === 'template-manage' ? (
        <TemplateManagePage onBack={backToChat} />
      ) : (
        <ConfigPage onBack={backToChat} />
      )}
    </div>
  );
}
