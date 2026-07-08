import { Collapse } from 'animal-island-ui';
import type { Citation } from '../types/chat';
import './CitationList.css';

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="citation-list">
      <p className="citation-list__label">引用来源</p>
      {citations.map((c, i) => (
        <Collapse
          key={`${c.docTitle}-${i}`}
          question={
            <span className="citation-list__question">
              📄 {c.kbName ? `${c.kbName} · ` : ''}
              {c.docTitle} · {c.section}
            </span>
          }
          answer={<p className="citation-list__excerpt">「{c.excerpt}」</p>}
        />
      ))}
    </div>
  );
}