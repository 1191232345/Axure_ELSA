export type MessageRole = 'user' | 'assistant';

export interface Citation {
  docTitle: string;
  section: string;
  excerpt: string;
  kbId?: string;
  kbName?: string;
}

export interface PrototypeArchiveItem {
  id?: string;
  pageId: string;
  moduleName: string;
  breadcrumb?: string;
  previewUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrototypeGenerated {
  pageId: string;
  moduleName: string;
  breadcrumb?: string;
  previewUrl: string;
}

export interface PrototypeSlotState {
  filled: Record<string, string>;
}

export interface PrototypeEditPendingState {
  phase?: 'select_page' | 'await_instruction' | 'await_edit_slots' | 'await_confirm';
  editId?: string;
  pageId?: string;
  moduleName?: string;
  summary?: string;
  previewUrl?: string;
  instruction?: string;
  instructions?: string[];
  revision?: number;
  editSlots?: Record<string, unknown>;
  /** @deprecated 兼容旧会话 */
  awaitingPageSelection?: boolean;
  pendingInstruction?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  refused?: boolean;
  streaming?: boolean;
  createdAt: number;
  prototypeGenerated?: PrototypeGenerated;
  openPrototypePreview?: boolean;
  prototypeEditPending?: PrototypeEditPendingState;
  prototypeEditResolved?: 'confirmed' | 'cancelled';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  summary?: string;
  userProfile?: string;
  prototypeState?: PrototypeSlotState | null;
  prototypeEditState?: PrototypeEditPendingState | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequestMessage {
  role: MessageRole;
  content: string;
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
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

export interface ChatRequestOptions {
  summary?: string;
  userProfile?: string;
  prototypeState?: PrototypeSlotState | null;
  prototypeEditState?: PrototypeEditPendingState | null;
  triggerPrototypePreview?: boolean;
}
