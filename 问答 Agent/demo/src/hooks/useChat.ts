import { useCallback, useState } from 'react';
import { createMessage, useChatSessions } from '../hooks/useChatSessions';
import { streamChat } from '../services/chatApi';
import { cancelPrototypeEdit, confirmPrototypeEdit } from '../services/prototypeApi';
import type { ChatRequestMessage, PrototypeEditPendingState } from '../types/chat';

const EDIT_CONFIRM_RE = /^(确认|确认替换|应用修改|就这样|可以了|好的确认|确认修改)(吧|了)?[。！!]?$/i;
const EDIT_CANCEL_RE = /^(取消|不要了|保持现状|算了|放弃修改|不改了)(吧|了)?[。！!]?$/i;
const EDIT_RESTART_RE = /^(编辑|修改|调整|更新)(一下)?原型|(编辑|修改|调整|更新)(?:一下)?[\s\S]*?原型/;

function inferEditResolution(text: string): 'confirmed' | 'cancelled' | null {
  const trimmed = text.trim();
  if (EDIT_CONFIRM_RE.test(trimmed)) return 'confirmed';
  if (EDIT_CANCEL_RE.test(trimmed)) return 'cancelled';
  return null;
}

function isEditRestart(text: string): boolean {
  return EDIT_RESTART_RE.test(text.trim());
}

function isAlreadyHandledEditError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('404') || msg.includes('未找到待确认') || msg.includes('未找到待确认的修改草稿');
}

export function useChat(
  onOpenPrototypePreview?: (focusPageId?: string) => void,
  onOpenPrototypeDesign?: () => void,
) {
  const {
    activeSession,
    activeId,
    appendMessage,
    patchMessage,
    patchSessionContext,
    resolvePrototypeEditPending,
    cancelAllPrototypeEditPending,
    newSession,
    selectSession,
    deleteSession,
    sessions,
  } = useChatSessions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [editActionLoading, setEditActionLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;

      const sessionId = activeId;
      const prevEditId = activeSession.prototypeEditState?.editId;
      const restartingEdit = isEditRestart(trimmed);

      if (restartingEdit) {
        cancelAllPrototypeEditPending(sessionId);
        patchSessionContext(sessionId, { prototypeEditState: null });
      }

      appendMessage(sessionId, createMessage('user', { content: trimmed }));

      const assistantId = crypto.randomUUID();
      appendMessage(
        sessionId,
        createMessage('assistant', { id: assistantId, content: '', streaming: true }),
      );

      setIsGenerating(true);

      const history: ChatRequestMessage[] = [
        ...activeSession.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: trimmed },
      ];

      try {
        const result = await streamChat(
          history,
          {
            summary: activeSession.summary,
            userProfile: activeSession.userProfile,
            prototypeState: activeSession.prototypeState ?? null,
            prototypeEditState: restartingEdit ? null : (activeSession.prototypeEditState ?? null),
          },
          (chunk) => {
            patchMessage(sessionId, assistantId, { content: chunk, streaming: true });
          },
        );

        patchMessage(sessionId, assistantId, {
          content: result.content,
          citations: result.citations,
          refused: result.refused,
          streaming: false,
          prototypeGenerated: result.mode === 'prototype_edit' ? undefined : result.prototypeGenerated,
          openPrototypePreview: result.mode === 'prototype_edit' ? false : result.openPrototypePreview,
          prototypeEditPending: result.prototypeEditPending,
        });
        patchSessionContext(sessionId, {
          summary: result.summary,
          userProfile: result.userProfile,
          prototypeState: result.prototypeState ?? null,
          prototypeEditState: result.prototypeEditState ?? null,
        });

        if (prevEditId && !result.prototypeEditState?.editId && result.mode === 'prototype_edit') {
          const resolution = inferEditResolution(trimmed);
          if (resolution) {
            resolvePrototypeEditPending(sessionId, prevEditId, resolution);
          }
        }

        if (result.openPrototypePreview && result.mode !== 'prototype_edit' && result.mode !== 'prototype_new') {
          queueMicrotask(() =>
            onOpenPrototypePreview?.(result.prototypeGenerated?.pageId),
          );
        }
        if (result.openPrototypeDesign) {
          queueMicrotask(() => onOpenPrototypeDesign?.());
        }
      } catch {
        patchMessage(sessionId, assistantId, {
          content: '哎呀，服务暂时不可用，请稍后再试～',
          streaming: false,
          refused: true,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [
      activeId,
      activeSession.messages,
      activeSession.summary,
      activeSession.userProfile,
      activeSession.prototypeState,
      activeSession.prototypeEditState,
      appendMessage,
      cancelAllPrototypeEditPending,
      isGenerating,
      onOpenPrototypePreview,
      onOpenPrototypeDesign,
      patchMessage,
      patchSessionContext,
      resolvePrototypeEditPending,
    ],
  );

  const confirmAllPrototypeEdits = useCallback(
    async (pending: PrototypeEditPendingState) => {
      if (!pending.editId || !pending.pageId || editActionLoading || isGenerating) return;
      const sessionId = activeId;
      setEditActionLoading(true);

      resolvePrototypeEditPending(sessionId, pending.editId, 'confirmed');
      patchSessionContext(sessionId, { prototypeEditState: null });

      const assistantId = crypto.randomUUID();
      appendMessage(
        sessionId,
        createMessage('assistant', { id: assistantId, content: '正在应用全部修改…', streaming: true }),
      );

      try {
        const result = await confirmPrototypeEdit(pending.pageId, pending.editId);
        const revisionNote =
          pending.revision && pending.revision > 1 ? `（共 ${pending.revision} 轮累积修改）` : '';
        patchMessage(sessionId, assistantId, {
          content: `已全部应用修改${revisionNote}：**${result.summary || result.moduleName}**\n\n**正式预览路径：**\n\`${result.previewUrl}\`\n\n修改已生效，可点击上方路径在新页面中查看。\n\n如需继续调整，直接描述修改内容；说「编辑原型」可选择其他页面开始新一轮编辑。`,
          streaming: false,
        });
      } catch (err) {
        if (isAlreadyHandledEditError(err)) {
          patchMessage(sessionId, assistantId, {
            content: '该修改已应用，无需重复确认。',
            streaming: false,
          });
        } else {
          patchMessage(sessionId, assistantId, {
            content: err instanceof Error ? err.message : '全部确认失败',
            streaming: false,
            refused: true,
            prototypeEditPending: pending,
          });
          patchSessionContext(sessionId, { prototypeEditState: pending });
        }
      } finally {
        setEditActionLoading(false);
      }
    },
    [
      activeId,
      appendMessage,
      editActionLoading,
      isGenerating,
      patchMessage,
      patchSessionContext,
      resolvePrototypeEditPending,
    ],
  );

  const cancelAllPrototypeEdits = useCallback(
    async (pending: PrototypeEditPendingState) => {
      if (!pending.editId || !pending.pageId || editActionLoading || isGenerating) return;
      const sessionId = activeId;
      setEditActionLoading(true);

      resolvePrototypeEditPending(sessionId, pending.editId, 'cancelled');
      patchSessionContext(sessionId, { prototypeEditState: null });

      const assistantId = crypto.randomUUID();
      appendMessage(
        sessionId,
        createMessage('assistant', { id: assistantId, content: '正在取消全部修改…', streaming: true }),
      );

      try {
        await cancelPrototypeEdit(pending.pageId, pending.editId);
        const revisionNote =
          pending.revision && pending.revision > 1 ? `（共 ${pending.revision} 轮）` : '';
        patchMessage(sessionId, assistantId, {
          content: `已取消全部未应用修改${revisionNote}，当前原型保持不变。\n\n如需继续，可描述新的修改内容，或说「编辑原型」选择其他页面开始新一轮编辑。`,
          streaming: false,
        });
      } catch (err) {
        if (isAlreadyHandledEditError(err)) {
          patchMessage(sessionId, assistantId, {
            content: '该修改已取消或失效，无需重复操作。',
            streaming: false,
          });
        } else {
          patchMessage(sessionId, assistantId, {
            content: err instanceof Error ? err.message : '全部取消失败',
            streaming: false,
            refused: true,
          });
        }
      } finally {
        setEditActionLoading(false);
      }
    },
    [activeId, appendMessage, editActionLoading, isGenerating, patchMessage, patchSessionContext, resolvePrototypeEditPending],
  );

  const triggerPrototypePreview = useCallback(() => {
    if (isGenerating) return;
    onOpenPrototypePreview?.();
  }, [isGenerating, onOpenPrototypePreview]);

  return {
    sessions,
    activeSession,
    activeId,
    isGenerating,
    editActionLoading,
    showContext,
    setShowContext,
    triggerPrototypePreview,
    sendMessage,
    confirmAllPrototypeEdits,
    cancelAllPrototypeEdits,
    newSession,
    selectSession,
    deleteSession,
  };
}
