import { useEffect, useState } from 'react';
import { Button, Input, Radio, Title } from 'animal-island-ui';
import { BackToChatButton } from './BackToChatButton';
import { fetchConfig, saveConfig } from '../services/configApi';
import type { AppConfig, ConfigFormValues, LlmProvider } from '../types/config';
import './ConfigPage.css';

interface ConfigPageProps {
  onBack: () => void;
}

const OLLAMA_DEFAULTS: Pick<ConfigFormValues, 'openaiBaseUrl' | 'chatModel' | 'embedModel'> = {
  openaiBaseUrl: 'http://localhost:11434/v1',
  chatModel: 'qwen2.5:3b',
  embedModel: 'bge-m3:latest',
};

const OPENAI_DEFAULTS: Pick<ConfigFormValues, 'openaiBaseUrl' | 'chatModel' | 'embedModel'> = {
  openaiBaseUrl: 'https://api.openai.com/v1',
  chatModel: 'gpt-4o-mini',
  embedModel: 'text-embedding-3-small',
};

function toFormValues(config: AppConfig): ConfigFormValues {
  return {
    llmProvider: config.llmProvider,
    openaiApiKey: config.apiKeyMasked,
    openaiBaseUrl: config.openaiBaseUrl,
    chatModel: config.chatModel,
    embedModel: config.embedModel,
    topK: config.topK,
    minScore: config.minScore,
    historyTurns: config.historyTurns,
    hybridSearch: config.hybridSearch ?? true,
    rerankEnabled: config.rerankEnabled ?? true,
    rerankCandidates: config.rerankCandidates ?? 20,
    rrfK: config.rrfK ?? 60,
  };
}

export function ConfigPage({ onBack }: ConfigPageProps) {
  const [form, setForm] = useState<ConfigFormValues | null>(null);
  const [meta, setMeta] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await fetchConfig();
        if (cancelled) return;
        setForm(toFormValues(config));
        setMeta(config);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '加载配置失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = <K extends keyof ConfigFormValues>(key: K, value: ConfigFormValues[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onProviderChange = (provider: LlmProvider) => {
    setForm((prev) => {
      if (!prev) return prev;
      const defaults = provider === 'ollama' ? OLLAMA_DEFAULTS : OPENAI_DEFAULTS;
      return {
        ...prev,
        llmProvider: provider,
        ...defaults,
        openaiApiKey: provider === 'ollama' ? 'ollama' : prev.openaiApiKey,
      };
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await saveConfig(form);
      setForm(toFormValues(saved));
      setMeta(saved);
      setMessage('配置已保存。若修改了 Embedding 模型，请到「📚 知识库」页重新构建索引。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-page">
      <header className="config-page__header">
        <Title size="middle" color="app-teal">
          模型配置 ⚙️
        </Title>
        <BackToChatButton onClick={onBack} />
      </header>

      <div className="config-page__body">
        <form className="config-page__card" onSubmit={onSubmit}>
          {loading && <p className="config-page__hint">正在加载配置…</p>}
          {!loading && form && (
            <>
              <section className="config-page__section">
                <h2 className="config-page__section-title">LLM 提供商</h2>
                <Radio
                  value={form.llmProvider}
                  direction="horizontal"
                  options={[
                    { label: 'OpenAI / 兼容 API', value: 'openai' },
                    { label: '本地 Ollama', value: 'ollama' },
                  ]}
                  onChange={(value) => onProviderChange(value as LlmProvider)}
                />
                <p className="config-page__hint">
                  配置保存到服务端 settings.json。Ollama 模式下无需真实 API Key。
                </p>
              </section>

              <section className="config-page__section">
                <h2 className="config-page__section-title">连接与模型</h2>
                <div className="config-page__field">
                  <label className="config-page__label" htmlFor="openaiBaseUrl">
                    API Base URL
                  </label>
                  <Input
                    id="openaiBaseUrl"
                    value={form.openaiBaseUrl}
                    onChange={(e) => patch('openaiBaseUrl', e.target.value)}
                  />
                </div>
                {form.llmProvider === 'openai' && (
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="openaiApiKey">
                      API Key
                    </label>
                    <Input
                      id="openaiApiKey"
                      type="password"
                      value={form.openaiApiKey}
                      placeholder={meta?.apiKeySet ? '留空则保持原 Key' : 'sk-...'}
                      onChange={(e) => patch('openaiApiKey', e.target.value)}
                    />
                  </div>
                )}
                <div className="config-page__field">
                  <label className="config-page__label" htmlFor="chatModel">
                    对话模型
                  </label>
                  <Input
                    id="chatModel"
                    value={form.chatModel}
                    onChange={(e) => patch('chatModel', e.target.value)}
                  />
                </div>
                <div className="config-page__field">
                  <label className="config-page__label" htmlFor="embedModel">
                    Embedding 模型
                  </label>
                  <Input
                    id="embedModel"
                    value={form.embedModel}
                    onChange={(e) => patch('embedModel', e.target.value)}
                  />
                  <p className="config-page__hint">
                    修改后请到「📚 知识库」页为各库重新构建索引；索引管理已整合至知识库页。
                  </p>
                </div>
              </section>

              <section className="config-page__section">
                <h2 className="config-page__section-title">检索参数</h2>
                <div className="config-page__row">
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="topK">
                      Top K
                    </label>
                    <Input
                      id="topK"
                      type="number"
                      min={1}
                      max={20}
                      value={String(form.topK)}
                      onChange={(e) => patch('topK', Number(e.target.value))}
                    />
                  </div>
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="minScore">
                      最低相似度
                    </label>
                    <Input
                      id="minScore"
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={String(form.minScore)}
                      onChange={(e) => patch('minScore', Number(e.target.value))}
                    />
                  </div>
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="historyTurns">
                      历史轮数
                    </label>
                    <Input
                      id="historyTurns"
                      type="number"
                      min={1}
                      max={20}
                      value={String(form.historyTurns)}
                      onChange={(e) => patch('historyTurns', Number(e.target.value))}
                    />
                  </div>
                </div>
              </section>

              <section className="config-page__section">
                <h2 className="config-page__section-title">混合检索与重排</h2>
                <div className="config-page__field">
                  <label className="config-page__label">
                    <input
                      type="checkbox"
                      checked={form.hybridSearch}
                      onChange={(e) => patch('hybridSearch', e.target.checked)}
                    />{' '}
                    启用 BM25 + 向量混合检索（RRF 融合）
                  </label>
                </div>
                <div className="config-page__field">
                  <label className="config-page__label">
                    <input
                      type="checkbox"
                      checked={form.rerankEnabled}
                      onChange={(e) => patch('rerankEnabled', e.target.checked)}
                    />{' '}
                    启用轻量重排（融合分 + 词面重叠）
                  </label>
                </div>
                <div className="config-page__row">
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="rerankCandidates">
                      重排候选数
                    </label>
                    <Input
                      id="rerankCandidates"
                      type="number"
                      min={5}
                      max={50}
                      value={String(form.rerankCandidates)}
                      onChange={(e) => patch('rerankCandidates', Number(e.target.value))}
                    />
                  </div>
                  <div className="config-page__field">
                    <label className="config-page__label" htmlFor="rrfK">
                      RRF 常数 K
                    </label>
                    <Input
                      id="rrfK"
                      type="number"
                      min={10}
                      max={120}
                      value={String(form.rrfK)}
                      onChange={(e) => patch('rrfK', Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="config-page__hint">
                  混合检索对关键词精确匹配更友好；重排会在 Top-N 候选内二次打分。召回测试可查看 vector / bm25 / fusion 分量。
                </p>
              </section>

              <div className="config-page__actions">
                <Button type="primary" htmlType="submit" disabled={saving}>
                  {saving ? '保存中…' : '保存配置'}
                </Button>
                {message && <span className="config-page__status config-page__status--ok">{message}</span>}
                {error && <span className="config-page__status config-page__status--error">{error}</span>}
              </div>

              {meta && (
                <div className="config-page__meta">
                  提供商：{meta.llmProvider} · 对话模型：{meta.chatModel} · Embedding：{meta.embedModel}
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
