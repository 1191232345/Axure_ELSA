import type {
  BatchRecallEvalResult,
  ChunkPreviewResult,
  KnowledgeBaseDetail,
  KnowledgeBaseListResponse,
  KnowledgeBaseSummary,
  RetrieveTestResult,
} from '../types/kb';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { detail?: string };
    return data.detail ?? text;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

export async function fetchKnowledgeBases(): Promise<KnowledgeBaseListResponse> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<KnowledgeBaseListResponse>;
}

export async function createKnowledgeBase(name: string, description = ''): Promise<KnowledgeBaseDetail> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<KnowledgeBaseDetail>;
}

export async function fetchKnowledgeBase(id: string): Promise<KnowledgeBaseDetail> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<KnowledgeBaseDetail>;
}

export async function updateKnowledgeBase(
  id: string,
  payload: Partial<{
    name: string;
    description: string;
    content: string;
    chunkSize: number;
    chunkOverlap: number;
  }>,
): Promise<KnowledgeBaseDetail> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<KnowledgeBaseDetail>;
}

export async function deleteKnowledgeBase(id: string): Promise<{ activeId: string }> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ activeId: string }>;
}

export async function activateKnowledgeBase(id: string): Promise<KnowledgeBaseSummary> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}/activate`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<KnowledgeBaseSummary>;
}

export async function previewKnowledgeBase(id: string): Promise<ChunkPreviewResult> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}/preview`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ChunkPreviewResult>;
}

export async function previewChunks(payload: {
  content: string;
  title?: string;
  chunkSize: number;
  chunkOverlap: number;
}): Promise<ChunkPreviewResult> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/preview-chunks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: payload.content,
      title: payload.title,
      chunkSize: payload.chunkSize,
      chunkOverlap: payload.chunkOverlap,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ChunkPreviewResult>;
}

export async function rebuildKnowledgeBase(id: string): Promise<{ message?: string; chunks: number }> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}/rebuild`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ message?: string; chunks: number }>;
}

export async function runBatchRecallEval(
  id: string,
  options?: { topK?: number; minScore?: number },
): Promise<BatchRecallEvalResult> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}/recall-eval-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topK: options?.topK,
      minScore: options?.minScore,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<BatchRecallEvalResult>;
}

export async function runRetrieveTest(
  id: string,
  query: string,
  options?: { topK?: number; minScore?: number },
): Promise<RetrieveTestResult> {
  const res = await fetch(`${API_BASE}/api/knowledge-bases/${id}/retrieve-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      topK: options?.topK,
      minScore: options?.minScore,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<RetrieveTestResult>;
}
