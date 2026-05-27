# 色彩系统

品牌色 + 功能色 + 中性色。

## 品牌色

| 名称 | 色值 | CSS变量 | 使用场景 |
|------|------|---------|----------|
| Primary | `#2a3b7d` | `--color-primary` | 主按钮、导航栏、重点文字 |
| Primary Light | `#3a4ca7` | `--color-primary-light` | 悬停状态、渐变背景 |
| Primary Dark | `#1e2d5f` | `--color-primary-dark` | 激活状态、深层背景 |
| Secondary | `#36CFC9` | `--color-secondary` | 辅助按钮、图标高亮 |
| Accent | `#722ED1` | `--color-accent` | 特殊强调、徽章 |

## 功能色

| 状态 | 色值 | 背景色 | 文字色 | 使用场景 |
|------|------|--------|--------|----------|
| 成功 | `#00B42A` | `#E8FFEC` | `#006B19` | 成功提示、启用状态 |
| 警告 | `#FF7D00` | `#FFF7E8` | `#994D00` | 警告提示、待处理 |
| 危险 | `#F53F3F` | `#FFECE8` | `#B3261E` | 错误提示、删除按钮 |
| 信息 | `#1677FF` | `#E8F3FF` | `#094D8C` | 信息提示、链接 |

## 中性色

| 色阶 | 色值 | 使用场景 |
|------|------|----------|
| 50 | `#FAFAFA` | 页面背景 |
| 100 | `#F5F5F5` | 卡片背景 |
| 200 | `#E5E7EB` | 边框、分割线 |
| 300 | `#D1D5DB` | 禁用边框 |
| 400 | `#9CA3AF` | 占位符文字 |
| 500 | `#6B7280` | 次要文字 |
| 600 | `#4B5563` | 常规文字 |
| 700 | `#374151` | 标题文字 |
| 800 | `#1F2937` | 重要文字 |
| 900 | `#111827` | 主标题 |

## Tailwind 配置

```javascript
colors: {
    primary: { DEFAULT: '#2a3b7d', light: '#3a4ca7', dark: '#1e2d5f' },
    secondary: { DEFAULT: '#36CFC9', light: '#5ED9D4', dark: '#2AB5AF' },
    accent: { DEFAULT: '#722ED1', light: '#8F4DE8', dark: '#5A1FB0' },
    success: { DEFAULT: '#00B42A', light: '#33D161', dark: '#008F22', bg: '#E8FFEC', text: '#006B19' },
    warning: { DEFAULT: '#FF7D00', light: '#FF9933', dark: '#CC6400', bg: '#FFF7E8', text: '#994D00' },
    danger: { DEFAULT: '#F53F3F', light: '#F97070', dark: '#C33232', bg: '#FFECE8', text: '#B3261E' },
    info: { DEFAULT: '#1677FF', light: '#4096FF', dark: '#0E5FCC', bg: '#E8F3FF', text: '#094D8C' },
    neutral: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' },
    dark: '#1D2129', border: '#E5E7EB', 'light-bg': '#FFFFFF', 'card-bg': '#FFFFFF'
}
```
