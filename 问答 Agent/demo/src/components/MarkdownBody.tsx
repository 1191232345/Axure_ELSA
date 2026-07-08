import ReactMarkdown from 'react-markdown';
import styles from './MarkdownBody.module.css';

interface MarkdownBodyProps {
  content: string;
}

export function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className={styles.body}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
