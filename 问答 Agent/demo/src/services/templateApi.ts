import type { PrototypeDesign } from '../types/prototypeDesign';
import type { PrototypeTemplateDetail, PrototypeTemplateSummary } from '../types/prototypeTemplate';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function fetchPrototypeTemplates(): Promise<PrototypeTemplateSummary[]> {
  const res = await fetch(`${API_BASE}/api/prototype-templates`);
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  const data = (await res.json()) as { items?: PrototypeTemplateSummary[] };
  return data.items ?? [];
}

export async function fetchPrototypeTemplate(templateId: string): Promise<PrototypeTemplateDetail> {
  const res = await fetch(`${API_BASE}/api/prototype-templates/${encodeURIComponent(templateId)}`);
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeTemplateDetail;
}

export async function createPrototypeTemplate(
  name: string,
  description: string,
  design?: PrototypeDesign,
): Promise<PrototypeTemplateDetail> {
  const res = await fetch(`${API_BASE}/api/prototype-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, design }),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeTemplateDetail;
}

export async function updatePrototypeTemplate(
  templateId: string,
  payload: { name?: string; description?: string; design?: PrototypeDesign },
): Promise<PrototypeTemplateDetail> {
  const res = await fetch(`${API_BASE}/api/prototype-templates/${encodeURIComponent(templateId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeTemplateDetail;
}

export async function deletePrototypeTemplate(templateId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/prototype-templates/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
}

export async function duplicatePrototypeTemplate(
  templateId: string,
  name?: string,
): Promise<PrototypeTemplateDetail> {
  const res = await fetch(`${API_BASE}/api/prototype-templates/${encodeURIComponent(templateId)}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(name ? { name } : {}),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return (await res.json()) as PrototypeTemplateDetail;
}
