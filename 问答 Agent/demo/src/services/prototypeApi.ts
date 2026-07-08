import type { PrototypeArchiveItem } from '../types/chat';
import type { PrototypeEditConfirmResult } from '../types/prototypeEdit';
import type { PrototypeDesign, PrototypeGenerateResult } from '../types/prototypeDesign';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function fetchPrototypes(): Promise<PrototypeArchiveItem[]> {
  const res = await fetch(`${API_BASE}/api/prototypes`);
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  const data = (await res.json()) as { items?: PrototypeArchiveItem[] };
  return data.items ?? [];
}

export async function fetchDesignTemplate(templateId: string = 'blank'): Promise<PrototypeDesign> {
  const res = await fetch(`${API_BASE}/api/prototypes/design-template?template=${encodeURIComponent(templateId)}`);
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeDesign;
}

export { fetchPrototypeTemplates } from './templateApi';

export async function generatePrototypeFromDesign(design: PrototypeDesign): Promise<PrototypeGenerateResult> {
  const res = await fetch(`${API_BASE}/api/prototypes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(design),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeGenerateResult;
}

export async function confirmPrototypeEdit(pageId: string, editId: string): Promise<PrototypeEditConfirmResult> {
  const res = await fetch(`${API_BASE}/api/prototypes/${encodeURIComponent(pageId)}/edit-confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editId }),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeEditConfirmResult;
}

export async function cancelPrototypeEdit(pageId: string, editId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/prototypes/${encodeURIComponent(pageId)}/edit-cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editId }),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
}

export function resolvePreviewUrl(previewUrl: string): string {
  if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
    return previewUrl;
  }
  if (previewUrl.startsWith('/')) {
    return `${API_BASE}${previewUrl}`;
  }
  return `${API_BASE}/${previewUrl}`;
}
