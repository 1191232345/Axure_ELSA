import { useEffect, useState } from 'react';
import { Button, Modal } from 'animal-island-ui';
import { fetchConfig } from '../services/configApi';
import { runBatchRecallEval, runRetrieveTest } from '../services/kbApi';
import type { BatchRecallEvalResult, RetrieveTestResult } from '../types/kb';
import './RecallTestModal.css';

interface RecallTestModalProps {
  open: boolean;
  kbId: string;
  kbName: string;
  indexReady: boolean;
  onClose: () => void;
}

type Tab = 'single' | 'batch';

export function RecallTestModal({ open, kbId, kbName, indexReady, onClose }: RecallTestModalProps) {
  const [tab, setTab] = useState<Tab>('single');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RetrieveTestResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchRecallEvalResult | null>(null);
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.35);
  const [hybridSearch, setHybridSearch] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const config = await fetchConfig();
        if (!cancelled) {
          setTopK(config.topK);
          setMinScore(config.minScore);
          setHybridSearch(config.hybridSearch ?? true);
        }
      } catch {
        /* 使用默认值 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTab('single');
      setQuery('');
      setResult(null);
      setBatchResult(null);
      setError('');
      setRunning(false);
    }
  }, [open]);

  const onRunSingle = async () => {
    const text = query.trim();
    if (!text) {
      setError('请输入测试问题');
      return;
    }
    setRunning(true);
    setError('');
    try {
      const data = await runRetrieveTest(kbId, text, { topK, minScore });
      setResult(data);
      setBatchResult(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : '召回测试失败');
    } finally {
      setRunning(false);
    }
  };

  const onRunBatch = async () => {
    setRunning(true);
    setError('');
    try {
      const data = await runBatchRecallEval(kbId, { topK, minScore });
      setBatchResult(data);
      setResult(null);
    } catch (err) {
      setBatchResult(null);
      setError(err instanceof Error ? err.message : '批量评测失败');
    } finally {
      setRunning(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void onRunSingle();
    }
  };

  return (
    <Modal
      open={open}
      title={`召回测试 · ${kbName}`}
      width={920}
      footer={null}
      typewriter={false}
      maskClosable={!running}
      onClose={onClose}
      className="kb-recall-modal"
    >
      <div className="kb-recall-modal__tabs">
        <button
          type="button"
          className={`kb-recall-modal__tab${tab === 'single' ? ' kb-recall-modal__tab--active' : ''}`}
          onClick={() => setTab('single')}
        >
          单条测试
        </button>
        <button
          type="button"
          className={`kb-recall-modal__tab${tab === 'batch' ? ' kb-recall-modal__tab--active' : ''}`}
          onClick={() => setTab('batch')}
        >
          批量评测
        </button>
      </div>

      <div className="kb-recall-modal__body">
        <aside className="kb-recall-modal__left">
          <p className="kb-recall-modal__params">
            Top K = {topK} · 置信度 ≥ {minScore}
            {hybridSearch && <span className="kb-recall-modal__params-hint"> · 混合检索已开启</span>}
            <span className="kb-recall-modal__params-hint">（来自 ⚙️ 配置）</span>
          </p>

          {!indexReady && (
            <p className="kb-recall-modal__warn">当前库尚未构建索引，请先构建后再测试。</p>
          )}

          {tab === 'single' ? (
            <div className="kb-recall-modal__composer">
              <textarea
                className="kb-recall-modal__input"
                value={query}
                disabled={running || !indexReady}
                placeholder="输入用户问题，模拟 RAG 检索…"
                rows={3}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="kb-recall-modal__composer-foot">
                <span className="kb-recall-modal__hint">⌘/Ctrl + Enter 快捷测试</span>
                <Button type="primary" size="small" disabled={running || !indexReady} onClick={() => void onRunSingle()}>
                  {running ? '测试中…' : '召回测试'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="kb-recall-modal__batch-intro">
              <p>
                读取本库目录下 <code>recall_tests.json</code> 中的用例，逐条检索并统计命中率。
              </p>
              <p className="kb-recall-modal__hint">
                用例格式：question（必填）、docTitle / section（期望命中，可选）
              </p>
              <Button type="primary" size="small" disabled={running || !indexReady} onClick={() => void onRunBatch()}>
                {running ? '评测中…' : '运行批量评测'}
              </Button>
            </div>
          )}

          {error && <p className="kb-recall-modal__error">{error}</p>}
        </aside>

        <section className="kb-recall-modal__right">
          {tab === 'single' && !result && !running && (
            <p className="kb-recall-modal__empty">在左侧输入问题并点击「召回测试」，此处展示 Top-K 召回结果与置信度。</p>
          )}

          {tab === 'batch' && !batchResult && !running && (
            <p className="kb-recall-modal__empty">点击「运行批量评测」，此处展示 recall_tests.json 的通过率与各用例详情。</p>
          )}

          {running && <p className="kb-recall-modal__empty">{tab === 'batch' ? '正在批量评测…' : '正在检索…'}</p>}

          {tab === 'single' && result && !running && (
            <>
              <div className="kb-recall-modal__summary">
                <span>
                  召回 <strong>{result.total}</strong> 条
                </span>
                <span className="kb-recall-modal__dot">·</span>
                <span>
                  候选 {result.candidates} 条（Top-{result.topK}）
                </span>
                <span className="kb-recall-modal__dot">·</span>
                <span>置信度阈值 ≥ {result.minScore}</span>
              </div>

              {result.items.length === 0 ? (
                <p className="kb-recall-modal__empty">无结果达到置信度阈值，请降低 minScore 或调整问题表述。</p>
              ) : (
                <ul className="kb-recall-modal__list">
                  {result.items.map((item) => (
                    <li
                      key={`${item.rank}-${item.docTitle}-${item.section}`}
                      className={`kb-recall-modal__item${item.passed ? '' : ' kb-recall-modal__item--below'}`}
                    >
                      <div className="kb-recall-modal__item-head">
                        <span className="kb-recall-modal__rank">#{item.rank}</span>
                        <span className="kb-recall-modal__score" title="融合置信度">
                          {(item.score * 100).toFixed(1)}%
                        </span>
                        {!item.passed && <span className="kb-recall-modal__below-tag">低于阈值</span>}
                      </div>
                      {(item.vectorScore != null || item.bm25Score != null) && (
                        <p className="kb-recall-modal__scores">
                          vector {((item.vectorScore ?? 0) * 100).toFixed(1)}%
                          {' · '}
                          bm25 {((item.bm25Score ?? 0) * 100).toFixed(1)}%
                        </p>
                      )}
                      <p className="kb-recall-modal__meta">
                        {item.docTitle} · {item.section}
                      </p>
                      <p className="kb-recall-modal__excerpt" title={item.excerpt}>{item.excerpt}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'batch' && batchResult && !running && (
            <>
              <div className="kb-recall-modal__summary">
                <span>
                  通过率 <strong>{(batchResult.passRate * 100).toFixed(1)}%</strong>
                </span>
                <span className="kb-recall-modal__dot">·</span>
                <span>
                  {batchResult.passed}/{batchResult.total} 通过
                </span>
                <span className="kb-recall-modal__dot">·</span>
                <span>Top-{batchResult.topK} · ≥ {batchResult.minScore}</span>
              </div>

              <ul className="kb-recall-modal__list kb-recall-modal__list--batch">
                {batchResult.cases.map((item) => (
                  <li
                    key={item.index}
                    className={`kb-recall-modal__item kb-recall-modal__item--batch${item.passed ? ' kb-recall-modal__item--pass' : ' kb-recall-modal__item--fail'}`}
                  >
                    <div className="kb-recall-modal__item-head">
                      <span className="kb-recall-modal__rank">#{item.index}</span>
                      <span className={`kb-recall-modal__batch-tag${item.passed ? ' kb-recall-modal__batch-tag--pass' : ''}`}>
                        {item.passed ? '通过' : '未通过'}
                      </span>
                      {item.matchedRank != null && (
                        <span className="kb-recall-modal__matched-rank">命中 rank #{item.matchedRank}</span>
                      )}
                    </div>
                    <p className="kb-recall-modal__meta">{item.question}</p>
                    {(item.expectedDocTitle || item.expectedSection) && (
                      <p className="kb-recall-modal__expected">
                        期望：{item.expectedDocTitle ?? '—'} · {item.expectedSection ?? '—'}
                      </p>
                    )}
                    {!item.passed && item.topHit && (
                      <p className="kb-recall-modal__top-hit">
                        Top-1：{item.topHit.docTitle} · {item.topHit.section}（{(item.topHit.score * 100).toFixed(1)}%）
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}
