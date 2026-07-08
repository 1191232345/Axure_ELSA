import { Button } from 'animal-island-ui';
import { EXAMPLE_QUESTIONS } from '../services/mockChat';
import './WelcomePanel.css';

interface WelcomePanelProps {
  onSelect: (q: string) => void;
  disabled?: boolean;
}

export function WelcomePanel({ onSelect, disabled }: WelcomePanelProps) {
  return (
    <div className="welcome-panel">
      <p className="welcome-panel__greeting">
        你好！我是<strong>对话助手</strong>，可以闲聊、检索知识库，也能通过对话收集需求并生成列表页原型。
      </p>
      <p className="welcome-panel__tip">
        日常问题直接聊；匹配知识库范围时自动 RAG 检索。点击 **✏️ 新建原型** 或在对话中说「新建列表页原型」打开需求配置页；说「查看所有原型」可预览归档。
      </p>
      <p className="welcome-panel__label">试试这些问题：</p>
      <div className="welcome-panel__chips">
        {EXAMPLE_QUESTIONS.map((q) => (
          <Button
            key={q}
            type="default"
            size="small"
            disabled={disabled}
            onClick={() => onSelect(q)}
          >
            {q}
          </Button>
        ))}
      </div>
    </div>
  );
}
