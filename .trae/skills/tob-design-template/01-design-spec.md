# 核心设计规范

本文档定义TOB产品的核心设计规范，确保所有模块保持一致的设计风格。

## 1. 主题色彩系统

### 1.1 主色调

```css
/* 主色调 */
--primary: #2a3b7d;           /* 主品牌色 - 深蓝 */
--primary-light: #3a4ca7;     /* 主色浅色变体 */
--secondary: #36CFC9;         /* 辅助色 - 青色 */
--accent: #722ED1;            /* 强调色 - 紫色 */

/* 功能色 */
--success: #00B42A;           /* 成功状态 */
--warning: #FF7D00;           /* 警告状态 */
--danger: #F53F3F;            /* 危险状态 */

/* 中性色 */
--dark: #1D2129;              /* 深色文字 */
--border: #E5E7EB;            /* 边框颜色 */
--light-bg: #FFFFFF;          /* 浅色背景 */
--card-bg: #FFFFFF;           /* 卡片背景 */
```

### 1.2 色彩使用规范

| 颜色类型 | 色值 | 使用场景 |
|----------|------|----------|
| primary | #2a3b7d | 主按钮、导航栏、重点文字、链接 |
| primary-light | #3a4ca7 | 悬停状态、渐变背景 |
| secondary | #36CFC9 | 辅助按钮、图标高亮 |
| accent | #722ED1 | 特殊强调、徽章 |
| success | #00B42A | 成功提示、启用状态 |
| warning | #FF7D00 | 警告提示、待处理状态 |
| danger | #F53F3F | 错误提示、删除按钮、禁用状态 |

## 2. Tailwind 配置

### 2.1 完整配置

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#2a3b7d',
                'primary-light': '#3a4ca7',
                secondary: '#36CFC9',
                accent: '#722ED1',
                success: '#00B42A',
                warning: '#FF7D00',
                danger: '#F53F3F',
                dark: '#1D2129',
                'light-bg': '#FFFFFF',
                'card-bg': '#FFFFFF',
                border: '#E5E7EB'
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
                'card-hover': '0 10px 25px -5px rgba(42, 59, 125, 0.1)',
                'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1)',
                'header': '0 2px 4px rgba(0, 0, 0, 0.05)'
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        }
    }
}
```

## 3. Tailwind 自定义工具类

### 3.1 工具类定义

```css
@layer utilities {
    .content-auto {
        content-visibility: auto;
    }
    .text-shadow {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .text-shadow-sm {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    .btn-primary {
        @apply bg-primary text-white px-4 py-2 rounded-lg transition-all hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2;
    }
    .btn-secondary {
        @apply bg-white text-primary border border-border px-4 py-2 rounded-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2;
    }
    .btn-danger {
        @apply bg-white text-danger border border-danger/20 px-4 py-2 rounded-lg transition-all hover:bg-danger/5 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:ring-offset-2;
    }
    .input-primary {
        @apply w-full px-4 py-2.5 rounded-lg border border-border bg-white text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all;
    }
    .form-label {
        @apply block text-sm font-medium text-gray-700 mb-1;
    }
    .checkbox-primary {
        @apply w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/30;
    }
    .scroll-smooth {
        scroll-behavior: smooth;
    }
    .scale-fade-in {
        animation: scaleFadeIn 0.3s ease-out forwards;
    }
    @keyframes scaleFadeIn {
        0% {
            opacity: 0;
            transform: scale(0.95);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    .scale-fade-out {
        animation: scaleFadeOut 0.2s ease-in forwards;
    }
    @keyframes scaleFadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.95);
        }
    }
}
```

## 4. 字体规范

### 4.1 字体家族

```css
font-family: system-ui, -apple-system, sans-serif;
```

### 4.2 字号规范

| 类型 | 字号 | 使用场景 |
|------|------|----------|
| h1 | 2rem (32px) | 页面主标题 |
| h2 | 1.4rem (22px) | 区块标题 |
| h3 | 1.15rem (18px) | 小节标题 |
| h4 | 1rem (16px) | 子标题 |
| body | 0.95rem (15px) | 正文内容 |
| small | 0.875rem (14px) | 辅助文字 |
| xs | 0.75rem (12px) | 标签、提示 |

## 5. 间距规范

### 5.1 常用间距

| 变量 | 值 | 使用场景 |
|------|-----|----------|
| p-1 | 0.25rem (4px) | 紧凑间距 |
| p-2 | 0.5rem (8px) | 小间距 |
| p-3 | 0.75rem (12px) | 中等间距 |
| p-4 | 1rem (16px) | 标准间距 |
| p-6 | 1.5rem (24px) | 大间距 |
| p-8 | 2rem (32px) | 区块间距 |

## 6. 圆角规范

| 变量 | 值 | 使用场景 |
|------|-----|----------|
| rounded | 0.25rem (4px) | 按钮、输入框 |
| rounded-lg | 0.5rem (8px) | 卡片、模态框 |
| rounded-xl | 0.75rem (12px) | 大卡片 |
| rounded-2xl | 1rem (16px) | 特大容器 |
| rounded-full | 9999px | 徽章、头像 |

## 7. 阴影规范

| 变量 | 值 | 使用场景 |
|------|-----|----------|
| shadow-card | 0 2px 8px rgba(0,0,0,0.05) | 卡片默认 |
| shadow-card-hover | 0 10px 25px rgba(42,59,125,0.1) | 卡片悬停 |
| shadow-dropdown | 0 4px 16px rgba(0,0,0,0.1) | 下拉菜单 |
| shadow-header | 0 2px 4px rgba(0,0,0,0.05) | 顶部导航 |
