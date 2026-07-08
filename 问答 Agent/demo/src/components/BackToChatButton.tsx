import { Button } from 'animal-island-ui';

interface BackToChatButtonProps {
  onClick: () => void;
}

export function BackToChatButton({ onClick }: BackToChatButtonProps) {
  return (
    <Button type="default" size="small" onClick={onClick}>
      ← 返回聊天
    </Button>
  );
}
