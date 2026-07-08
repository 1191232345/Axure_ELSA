import { useState, KeyboardEvent } from 'react';
import { Button, Input } from 'animal-island-ui';
import './InputBar.css';

interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="input-bar">
      <Input
        className="input-bar__field"
        placeholder="输入你的问题…（Enter 发送）"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        size="large"
      />
      <Button type="primary" size="large" onClick={submit} disabled={disabled || !value.trim()} loading={disabled}>
        发送
      </Button>
    </div>
  );
}
