import ReactMarkdown from 'react-markdown';
import { Button, Card } from 'animal-island-ui';
import type { ChatMessage } from '../types/chat';
import { resolvePreviewUrl } from '../services/prototypeApi';
import { CitationList } from './CitationList';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenPrototypePreview?: (focusPageId?: string) => void;
}

export function MessageBubble({ message, onOpenPrototypePreview }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="message-row message-row--user">
        <Card color="app-blue" className="message-bubble message-bubble--user">
          <p>{message.content}</p>
        </Card>
      </div>
    );
  }

  const editPending = message.prototypeEditPending;
  const editResolved = message.prototypeEditResolved;
  const draftPreviewUrl =
    editPending?.editId && editPending.previewUrl ? resolvePreviewUrl(editPending.previewUrl) : '';

  const body = (
    <>
      {message.streaming && !message.content ? (
        <p className="message-bubble__typing">正在思考…</p>
      ) : (
        <div className="message-bubble__markdown">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      )}
      {!message.streaming && message.citations && message.citations.length > 0 && (
        <CitationList citations={message.citations} />
      )}
      {!message.streaming && editPending?.editId && editPending.previewUrl && !editResolved && (
        <div className="message-bubble__edit-pending message-bubble__edit-pending--compact">
          <p className="message-bubble__edit-note">
            草稿已生成，请在底部操作栏使用「全部确认」或「全部取消」。
          </p>
          <Button
            type="default"
            size="small"
            onClick={() => window.open(draftPreviewUrl, '_blank')}
          >
            预览本轮草稿
          </Button>
        </div>
      )}
      {editResolved === 'confirmed' && (
        <p className="message-bubble__edit-resolved message-bubble__edit-resolved--ok">已确认应用修改</p>
      )}
      {editResolved === 'cancelled' && (
        <p className="message-bubble__edit-resolved message-bubble__edit-resolved--cancel">已取消修改</p>
      )}
      {!message.streaming && (message.prototypeGenerated || message.openPrototypePreview) && onOpenPrototypePreview && (
        <div className="message-bubble__actions">
          <Button
            type="default"
            size="small"
            onClick={() => onOpenPrototypePreview(message.prototypeGenerated?.pageId)}
          >
            {message.prototypeGenerated ? '打开原型预览' : '查看原型归档'}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="message-row message-row--bot">
      <div className="message-bubble__avatar" aria-hidden>
        🏝
      </div>
      <Card
        color={message.refused && !message.citations?.length ? 'app-yellow' : 'default'}
        className="message-bubble message-bubble--bot"
      >
        {body}
      </Card>
    </div>
  );
}
