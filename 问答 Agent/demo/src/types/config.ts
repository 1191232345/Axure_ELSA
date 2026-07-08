export type LlmProvider = 'openai' | 'ollama';

export interface AppConfig {
  llmProvider: LlmProvider;
  openaiBaseUrl: string;
  chatModel: string;
  embedModel: string;
  topK: number;
  minScore: number;
  historyTurns: number;
  hybridSearch: boolean;
  rerankEnabled: boolean;
  rerankCandidates: number;
  rrfK: number;
  apiKeySet: boolean;
  apiKeyMasked: string;
  activeKbId?: string;
}

export interface ConfigFormValues {
  llmProvider: LlmProvider;
  openaiApiKey: string;
  openaiBaseUrl: string;
  chatModel: string;
  embedModel: string;
  topK: number;
  minScore: number;
  historyTurns: number;
  hybridSearch: boolean;
  rerankEnabled: boolean;
  rerankCandidates: number;
  rrfK: number;
}
