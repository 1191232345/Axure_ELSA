import type {
  ChatRequestMessage,
  ChatRequestOptions,
  ChatResponse,
  Citation,
  PrototypeArchiveItem,
  PrototypeEditPendingState,
  PrototypeGenerated,
  PrototypeSlotState,
} from '../types/chat';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

interface DonePayload {
  citations?: Citation[];
  refused?: boolean;
  summary?: string;
  userProfile?: string;
  mode?: 'chat' | 'rag' | 'prototype_new' | 'prototype_preview' | 'prototype_edit';
  kbId?: string;
  kbName?: string;
  prototypeState?: PrototypeSlotState | null;
  prototypeEditState?: PrototypeEditPendingState | null;
  prototypeEditPending?: PrototypeEditPendingState;
  prototypeGenerated?: PrototypeGenerated;
  prototypes?: PrototypeArchiveItem[];
  openPrototypePreview?: boolean;
  openPrototypeDesign?: boolean;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = 'message';
  let data = '';
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  return data ? { event, data } : null;
}

/** 调用真实 RAG 后端（SSE） */
export async function streamChat(
  messages: ChatRequestMessage[],
  options: ChatRequestOptions,
  onChunk: (partial: string) => void,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      summary: options.summary ?? '',
      userProfile: options.userProfile ?? '',
      prototypeState: options.prototypeState ?? null,
      prototypeEditState: options.prototypeEditState ?? null,
      triggerPrototypePreview: Boolean(options.triggerPrototypePreview),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  if (!res.body) throw new Error('响应体为空');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let citations: Citation[] = [];
  let refused = false;
  let summary = options.summary ?? '';
  let userProfile = options.userProfile ?? '';
  let mode: ChatResponse['mode'];
  let kbId: string | undefined;
  let kbName: string | undefined;
  let prototypeState: PrototypeSlotState | null | undefined;
  let prototypeEditState: PrototypeEditPendingState | null | undefined;
  let prototypeEditPending: PrototypeEditPendingState | undefined;
  let prototypeGenerated: PrototypeGenerated | undefined;
  let prototypes: PrototypeArchiveItem[] | undefined;
  let openPrototypePreview = false;
  let openPrototypeDesign = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const parsed = parseSseBlock(part.trim());
      if (!parsed) continue;
      const payload = JSON.parse(parsed.data) as Record<string, unknown>;

      if (parsed.event === 'token') {
        const text = String(payload.text ?? '');
        content += text;
        onChunk(content);
      }
      if (parsed.event === 'done') {
        const donePayload = payload as DonePayload;
        citations = donePayload.citations ?? [];
        refused = Boolean(donePayload.refused);
        if (donePayload.summary) summary = donePayload.summary;
        if (donePayload.userProfile) userProfile = donePayload.userProfile;
        if (donePayload.mode) mode = donePayload.mode;
        if (donePayload.kbId) kbId = donePayload.kbId;
        if (donePayload.kbName) kbName = donePayload.kbName;
        if ('prototypeState' in donePayload) prototypeState = donePayload.prototypeState ?? null;
        if ('prototypeEditState' in donePayload) prototypeEditState = donePayload.prototypeEditState ?? null;
        if (donePayload.prototypeEditPending) prototypeEditPending = donePayload.prototypeEditPending;
        if (donePayload.prototypeGenerated) prototypeGenerated = donePayload.prototypeGenerated;
        if (donePayload.prototypes) prototypes = donePayload.prototypes;
        if (donePayload.openPrototypePreview) openPrototypePreview = true;
        if (donePayload.openPrototypeDesign) openPrototypeDesign = true;
      }
      if (parsed.event === 'error') {
        throw new Error(String(payload.message ?? '服务错误'));
      }
    }
  }

  return {
    content,
    citations,
    refused,
    summary,
    userProfile,
    mode,
    kbId,
    kbName,
    prototypeState,
    prototypeEditState,
    prototypeEditPending,
    prototypeGenerated,
    prototypes,
    openPrototypePreview,
    openPrototypeDesign,
  };
}

export { EXAMPLE_QUESTIONS } from './mockChat';
