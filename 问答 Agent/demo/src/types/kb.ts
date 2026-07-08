export interface KnowledgeBaseSummary {
  id: string;
  name: string;
  description: string;
  chunkSize: number;
  chunkOverlap: number;
  createdAt?: string;
  updatedAt?: string;
  active: boolean;
  indexReady: boolean;
  chunks: number;
  indexBuiltAt?: string | null;
}

export interface KnowledgeBaseDetail extends KnowledgeBaseSummary {
  content: string;
}

export interface ChunkPreviewItem {
  index: number;
  docTitle?: string;
  section: string;
  text: string;
  chars: number;
  chunkId?: string;
  anchor?: string;
  blockType?: string;
  hasParent?: boolean;
}

export interface ChunkPreviewResult {
  title: string;
  total: number;
  chunks: ChunkPreviewItem[];
}

export interface KnowledgeBaseListResponse {
  activeId: string;
  items: KnowledgeBaseSummary[];
}

export interface RetrieveTestItem {
  rank: number;
  docTitle: string;
  section: string;
  text: string;
  excerpt: string;
  score: number;
  passed: boolean;
  vectorScore?: number;
  bm25Score?: number;
  fusionScore?: number;
}

export interface RetrieveTestResult {
  kbId: string;
  query: string;
  topK: number;
  minScore: number;
  total: number;
  candidates: number;
  items: RetrieveTestItem[];
}

export interface BatchRecallCaseResult {
  index: number;
  question: string;
  expectedDocTitle?: string | null;
  expectedSection?: string | null;
  passed: boolean;
  matchedRank?: number | null;
  matched?: {
    docTitle: string;
    section: string;
    score: number;
    vectorScore?: number;
    bm25Score?: number;
  } | null;
  topHit?: {
    docTitle: string;
    section: string;
    score: number;
  } | null;
}

export interface BatchRecallEvalResult {
  kbId: string;
  topK: number;
  minScore: number;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  cases: BatchRecallCaseResult[];
}
