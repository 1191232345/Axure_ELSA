# 设计令牌

完整的设计系统令牌，包含色彩、字体、间距、阴影、布局等所有设计规范。

> **新模块必须使用本文件定义的标准主题（`#2a3b7d`）。**  
> 费用管理部分旧模块使用 Legacy 主题（`#1B3A4B`），维护旧页面时沿用，不得扩散到新模块。详见 [skill-maintenance.md](docs/skill-maintenance.md)。

## 色彩系统

### 品牌色

| 名称 | 色值 | CSS变量 | 使用场景 |
|------|------|---------|----------|
| Primary | `#2a3b7d` | `--color-primary` | 主按钮、导航栏、重点文字 |
| Primary Light | `#3a4ca7` | `--color-primary-light` | 悬停状态、渐变背景 |
| Primary Dark | `#1e2d5f` | `--color-primary-dark` | 激活状态、深层背景 |
| Secondary | `#36CFC9` | `--color-secondary` | 辅助按钮、图标高亮 |
| Accent | `#722ED1` | `--color-accent` | 特殊强调、徽章 |

### 功能色

| 状态 | 色值 | 背景色 | 文字色 | 使用场景 |
|------|------|--------|--------|----------|
| 成功 | `#00B42A` | `#E8FFEC` | `#006B19` | 成功提示、启用状态 |
| 警告 | `#FF7D00` | `#FFF7E8` | `#994D00` | 警告提示、待处理 |
| 危险 | `#F53F3F` | `#FFECE8` | `#B3261E` | 错误提示、删除按钮 |
| 信息 | `#1677FF` | `#E8F3FF` | `#094D8C` | 信息提示、链接 |

### 中性色

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

## 字体规范

### 字体家族

```javascript
fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
}
```

### 字号系统

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

### 字重

| 字重 | 值 | 使用场景 |
|------|-----|----------|
| Normal | 400 | 正文内容 |
| Medium | 500 | 次级标题、按钮文字 |
| Semibold | 600 | 主要标题、导航项（推荐） |
| Bold | 700 | 强调文字、数字展示 |

## 间距与圆角

### 间距系统

| 等级 | 值 | 像素 | 使用场景 |
|------|-----|------|----------|
| 1 | 0.25rem | 4px | 图标与文字间距 |
| 2 | 0.5rem | 8px | 小元素间距 |
| 3 | 0.75rem | 12px | 列表项间距 |
| 4 | 1rem | 16px | 标准间距（**最常用**） |
| 6 | 1.5rem | 24px | 区块间距 |
| 8 | 2rem | 32px | 章节间距 |
| 12 | 3rem | 48px | 页面章节间隔 |
| 16 | 4rem | 64px | 页面顶部/底部留白 |

### 圆角规范

| 等级 | 值 | 像素 | 使用场景 |
|------|-----|------|----------|
| none | 0 | 0px | 表格 |
| sm | 0.125rem | 2px | 标签、徽章 |
| DEFAULT | 0.375rem | 6px | 输入框、小按钮 |
| md | 0.5rem | 8px | 标准按钮、卡片（**常用**） |
| lg | 0.75rem | 12px | 模态框、大卡片 |
| xl | 1rem | 16px | 特殊容器 |
| full | 9999px | 圆形 | 头像、圆形按钮 |

## 阴影与动画

### 阴影系统

| 类型 | 值 | 使用场景 |
|------|-----|----------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | 微弱阴影 |
| DEFAULT | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | 默认阴影 |
| card | `0 2px 8px rgba(0,0,0,0.05)` | **标准卡片**（最常用） |
| card-hover | `0 10px 25px -5px rgba(42,59,125,0.1)` | 卡片悬停 |
| dropdown | `0 4px 16px rgba(0,0,0,0.1)` | 下拉菜单 |
| modal | `0 20px 60px -15px rgba(0,0,0,0.15)` | 模态框 |
| button | `0 2px 4px rgba(0,0,0,0.08)` | 按钮 |

### 过渡动画

| 时长 | 值 | 使用场景 |
|------|-----|----------|
| 75ms | 极快 | 按钮 hover |
| 150ms | 快速 | 颜色渐变 |
| 300ms | 标准 | 展开/收起（**最常用**） |
| 500ms | 慢速 | 页面转场 |

| 缓动 | 值 | 使用场景 |
|------|-----|----------|
| smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认平滑过渡 |
| ease-in | `cubic-bezier(0.4, 0, 1, 1)` | 缓入 |
| ease-out | `cubic-bezier(0, 0, 0.2, 1)` | 缓出 |
| bounce | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 弹跳 |

## 布局与层级

### 断点系统

| 断点 | 值 | 设备 | Tailwind前缀 |
|------|-----|------|-------------|
| sm | ≥640px | 大屏手机 | `sm:` |
| md | ≥768px | 平板 | `md:` |
| lg | ≥1024px | 笔记本 | `lg:`（**最常用**） |
| xl | ≥1280px | 台式机 | `xl:` |
| 2xl | ≥1536px | 2K显示器 | `2xl:` |

### z-index 层级

| 层级 | z-index | 使用场景 |
|------|---------|----------|
| Dropdown | 10 | 下拉菜单 |
| Sticky | 20 | 固定导航栏 |
| Overlay | 30 | 弹出层 |
| Modal Backdrop | 40 | 模态框遮罩 |
| Modal Content | 50 | 模态框内容 |
| Toast | 60 | 全局通知 |

## Tailwind 完整配置

可直接复制到项目中使用的完整配置对象。

```javascript
const DESIGN_TOKENS = {
    theme: {
        extend: {
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
            },
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
                '5xl': ['2rem', { lineHeight: '2.25rem' }]
            },
            spacing: {
                0: '0', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem',
                2: '0.5rem', 2.5: '0.625rem', 3: '0.75rem', 4: '1rem',
                5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem',
                12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem'
            },
            borderRadius: {
                none: '0', sm: '0.125rem', DEFAULT: '0.375rem', md: '0.5rem',
                lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', full: '9999px'
            },
            boxShadow: {
                sm: '0 1px 2px rgba(0,0,0,0.05)',
                DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                card: '0 2px 8px rgba(0,0,0,0.05)',
                'card-hover': '0 10px 25px -5px rgba(42,59,125,0.1)',
                dropdown: '0 4px 16px rgba(0,0,0,0.1)',
                modal: '0 20px 60px -15px rgba(0,0,0,0.15)',
                button: '0 2px 4px rgba(0,0,0,0.08)'
            },
            screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
            zIndex: { 0: '0', 10: '10', 20: '20', 30: '30', 40: '40', 50: '50', 60: '60' }
        }
    }
};
```

## 使用规范

1. **优先使用CSS变量**：禁止硬编码颜色值
2. **间距优先级**：优先使用标准间距（4px、8px、16px）
3. **圆角一致性**：同类元素使用相同圆角等级
4. **阴影层次**：根据元素层级选择合适阴影
5. **动画时长**：默认使用300ms，交互反馈使用150ms
