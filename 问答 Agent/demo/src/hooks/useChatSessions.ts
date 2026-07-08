import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage, ChatSession } from '../types/chat';

const STORAGE_KEY = 'warehouse-qa-sessions';

function uid() {
  return crypto.randomUUID();
}

function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return '新对话';
  return firstUser.content.slice(0, 18) + (firstUser.content.length > 18 ? '…' : '');
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw) as ChatSession[];
    return sessions.map((session) => ({
      ...session,
      messages: session.messages.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    }));
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function createEmptySession(): ChatSession {
  const now = Date.now();
  return {
    id: uid(),
    title: '新对话',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function canDeleteSession(session: ChatSession, sessions: ChatSession[]): boolean {
  if (sessions.length > 1) return true;
  return (
    session.messages.length > 0 ||
    Boolean(session.summary?.trim()) ||
    Boolean(session.userProfile?.trim())
  );
}

export { canDeleteSession };

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const loaded = loadSessions();
    return loaded.length > 0 ? loaded : [createEmptySession()];
  });
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.id ?? '');

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const updateSession = useCallback((sessionId: string, updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const next = updater(s);
        return { ...next, updatedAt: Date.now(), title: deriveTitle(next.messages) };
      }),
    );
  }, []);

  const newSession = useCallback(() => {
    const session = createEmptySession();
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
  }, []);

  const selectSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionId);
      if (idx === -1) return prev;

      const target = prev[idx];
      if (!canDeleteSession(target, prev)) return prev;

      const remaining = prev.filter((s) => s.id !== sessionId);
      const nextSessions = remaining.length === 0 ? [createEmptySession()] : remaining;

      queueMicrotask(() => {
        setActiveId((currentActive) => {
          if (currentActive !== sessionId) return currentActive;
          if (remaining.length === 0) return nextSessions[0].id;
          return remaining[Math.min(idx, remaining.length - 1)].id;
        });
      });

      return nextSessions;
    });
  }, []);

  const appendMessage = useCallback(
    (sessionId: string, message: ChatMessage) => {
      updateSession(sessionId, (s) => ({
        ...s,
        messages: [...s.messages, message],
      }));
    },
    [updateSession],
  );

  const patchMessage = useCallback(
    (sessionId: string, messageId: string, patch: Partial<ChatMessage>) => {
      updateSession(sessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      }));
    },
    [updateSession],
  );

  const patchSessionContext = useCallback(
    (
      sessionId: string,
      patch: {
        summary?: string;
        userProfile?: string;
        prototypeState?: ChatSession['prototypeState'];
        prototypeEditState?: ChatSession['prototypeEditState'];
      },
    ) => {
      updateSession(sessionId, (s) => ({ ...s, ...patch }));
    },
    [updateSession],
  );

  const resolvePrototypeEditPending = useCallback(
    (sessionId: string, editId: string, status: 'confirmed' | 'cancelled') => {
      updateSession(sessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) => {
          if (m.prototypeEditPending?.editId !== editId) return m;
          return { ...m, prototypeEditResolved: status };
        }),
      }));
    },
    [updateSession],
  );

  const cancelAllPrototypeEditPending = useCallback((sessionId: string) => {
    updateSession(sessionId, (s) => ({
      ...s,
      messages: s.messages.map((m) => {
        if (!m.prototypeEditPending?.editId || m.prototypeEditResolved) return m;
        return { ...m, prototypeEditResolved: 'cancelled' };
      }),
    }));
  }, [updateSession]);

  return {
    sessions,
    activeSession,
    activeId,
    newSession,
    selectSession,
    deleteSession,
    appendMessage,
    patchMessage,
    patchSessionContext,
    resolvePrototypeEditPending,
    cancelAllPrototypeEditPending,
  };
}

export function createMessage(
  role: ChatMessage['role'],
  partial: Partial<ChatMessage> & Pick<ChatMessage, 'content'>,
): ChatMessage {
  return {
    id: partial.id ?? uid(),
    role,
    content: partial.content,
    citations: partial.citations,
    refused: partial.refused,
    streaming: partial.streaming,
    createdAt: Date.now(),
  };
}
