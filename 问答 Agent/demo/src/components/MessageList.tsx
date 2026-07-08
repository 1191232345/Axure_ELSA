import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { WelcomePanel } from './WelcomePanel';
import './MessageList.css';

interface MessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onExampleSelect: (q: string) => void;
  onOpenPrototypePreview?: (focusPageId?: string) => void;
}

export function MessageList({
  messages,
  isGenerating,
  onExampleSelect,
  onOpenPrototypePreview,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <WelcomePanel onSelect={onExampleSelect} disabled={isGenerating} />
      ) : (
        messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onOpenPrototypePreview={onOpenPrototypePreview}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
