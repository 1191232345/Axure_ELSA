import { useCallback, useEffect, useState } from 'react';
import { Button, Title } from 'animal-island-ui';
import {
  fetchDesignTemplate,
  fetchPrototypeTemplates,
  generatePrototypeFromDesign,
} from '../services/prototypeApi';
import type { DesignSection, PrototypeDesign } from '../types/prototypeDesign';
import { DESIGN_SECTIONS } from '../types/prototypeDesign';
import type { PrototypeTemplateSummary } from '../types/prototypeTemplate';
import { BackToChatButton } from './BackToChatButton';
import { DesignConfigPanel } from './DesignConfigPanel';
import './PrototypeDesignPage.css';

interface PrototypeDesignPageProps {
  onBack: () => void;
  onGenerated: (pageId: string) => void;
  onOpenTemplateManage: () => void;
}

export function PrototypeDesignPage({ onBack, onGenerated, onOpenTemplateManage }: PrototypeDesignPageProps) {
  const [section, setSection] = useState<DesignSection>('basic');
  const [design, setDesign] = useState<PrototypeDesign | null>(null);
  const [templates, setTemplates] = useState<PrototypeTemplateSummary[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTemplate = useCallback(async (templateId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDesignTemplate(templateId);
      setDesign(data);
      setSelectedTemplateId(templateId);
      const item = templates.find((t) => t.id === templateId);
      setMessage(item ? `已加载模板「${item.name}」` : '已加载模板');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载模板失败');
    } finally {
      setLoading(false);
    }
  }, [templates]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const list = await fetchPrototypeTemplates();
        setTemplates(list);
        const initial = list[0]?.id ?? 'blank';
        const data = await fetchDesignTemplate(initial);
        setDesign(data);
        setSelectedTemplateId(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载模板失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onGenerate = async () => {
    if (!design) return;
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const result = await generatePrototypeFromDesign(design);
      const suffix = result.enriched === false ? '（规则模板）' : '';
      setMessage(`原型「${result.moduleName}」已生成${suffix}`);
      onGenerated(result.pageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const currentSection = DESIGN_SECTIONS.find((s) => s.id === section);

  return (
    <div className="design-page">
      <aside className="design-sidebar">
        <div className="design-sidebar__head">
          <Title size="small" color="app-teal">
            需求配置
          </Title>
        </div>
        <nav className="design-sidebar__nav">
          {DESIGN_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`design-sidebar__tab${section === item.id ? ' design-sidebar__tab--active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              <span className="design-sidebar__tab-label">{item.label}</span>
              <span className="design-sidebar__tab-hint">{item.hint}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="design-main">
        <header className="design-header">
          <div className="design-header__info">
            <h1 className="design-header__title">{currentSection?.label ?? '需求配置'}</h1>
            <p className="design-header__desc">{currentSection?.hint}</p>
          </div>
          <div className="design-header__actions">
            <label className="design-header__template-select">
              <span>起始模板</span>
              <select
                value={selectedTemplateId}
                disabled={loading}
                onChange={(e) => void loadTemplate(e.target.value)}
              >
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.system ? '（内置）' : ''}
                  </option>
                ))}
              </select>
            </label>
            <Button type="default" size="small" onClick={onOpenTemplateManage}>
              模板管理
            </Button>
            <Button type="primary" size="small" disabled={loading || generating || !design} onClick={() => void onGenerate()}>
              {generating ? 'AI 补全并生成…' : '生成原型'}
            </Button>
            <BackToChatButton onClick={onBack} />
          </div>
        </header>

        {message && <p className="design-banner design-banner--ok">{message}</p>}
        {error && <p className="design-banner design-banner--err">{error}</p>}

        <div className="design-body">
          {loading && <p className="design-loading">正在加载模板…</p>}
          {!loading && design && (
            <DesignConfigPanel design={design} section={section} onChange={setDesign} />
          )}
        </div>
      </div>
    </div>
  );
}
