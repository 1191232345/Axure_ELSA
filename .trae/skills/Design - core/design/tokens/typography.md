# 字体规范

字体家族 + 字号系统 + 字重。

## 字体家族

```javascript
fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
}
```

## 字号系统

| 等级 | 值 | 像素 | 行高 | 使用场景 |
|------|-----|------|------|----------|
| xs | 0.75rem | 12px | 16px | 标签、版权信息 |
| sm | 0.875rem | 14px | 20px | 表格内容、按钮文字 |
| base | 0.95rem | 15px | 24px | 正文内容（默认） |
| lg | 1rem | 16px | 24px | 大正文 |
| xl | 1.125rem | 18px | 28px | 小标题、卡片标题 |
| 2xl | 1.25rem | 20px | 28px | 中标题、模态框标题 |
| 3xl | 1.4rem | 22px | 32px | 区块标题 |
| 4xl | 1.875rem | 30px | 36px | 大标题 |
| 5xl | 2rem | 32px | 36px | 页面主标题 |

## 字重

| 字重 | 值 | 使用场景 |
|------|-----|----------|
| Normal | 400 | 正文内容 |
| Medium | 500 | 次级标题、按钮文字 |
| Semibold | 600 | 主要标题、导航项（推荐） |
| Bold | 700 | 强调文字、数字展示 |

## Tailwind 配置

```javascript
fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
},
fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['0.95rem', { lineHeight: '1.5rem' }],
    lg: ['1rem', { lineHeight: '1.5rem' }],
    xl: ['1.125rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
    '3xl': ['1.4rem', { lineHeight: '2rem' }],
    '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '5xl': ['2rem', { lineHeight: '2.25rem' }],
    '6xl': ['2.5rem', { lineHeight: '1' }]
}
```
