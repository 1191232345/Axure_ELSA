import type { AppConfig, ConfigFormValues } from '../types/config';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch(`${API_BASE}/api/config`);
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<AppConfig>;
}

export async function saveConfig(values: ConfigFormValues): Promise<AppConfig> {
  const payload: Record<string, unknown> = {
    llmProvider: values.llmProvider,
    openaiBaseUrl: values.openaiBaseUrl.trim(),
    chatModel: values.chatModel.trim(),
    embedModel: values.embedModel.trim(),
    topK: values.topK,
    minScore: values.minScore,
    historyTurns: values.historyTurns,
    hybridSearch: values.hybridSearch,
    rerankEnabled: values.rerankEnabled,
    rerankCandidates: values.rerankCandidates,
    rrfK: values.rrfK,
  };

  const key = values.openaiApiKey.trim();
  if (key) payload.openaiApiKey = key;

  const res = await fetch(`${API_BASE}/api/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<AppConfig>;
}
