# 设计令牌（Design Tokens）

本文档定义TOB产品的**统一设计令牌系统**，是所有设计规范、模板和组件的**唯一数据源**。

> **重要**：所有模板文件应引用本文件，禁止重复定义设计变量。

## 📌 使用说明

### 在 Tailwind 配置中引用

```javascript
// tailwind.config.js
const DESIGN_TOKENS = require('./00-design-tokens');

tailwind.config = {
    theme: {
        extend: {
            colors: DESIGN_TOKENS.colors,
            spacing: DESIGN_TOKENS.spacing,
            fontSize: DESIGN_TOKENS.fontSizes,
            boxShadow: DESIGN_TOKENS.shadows,
            borderRadius: DESIGN_TOKENS.borderRadius
        }
    }
};
```

### 在 HTML 中内联配置

```html
<script>
    const DESIGN_TOKENS = {
        colors: { /* ... */ },
        spacing: { /* ... */ },
        // ...
    };

    tailwind.config = {
        theme: { extend: DESIGN_TOKENS }
    };
</script>
```

---

## 1. 色彩系统（Colors）

### 1.1 品牌色

```javascript
colors: {
    // 主品牌色
    primary: {
        DEFAULT: '#2a3b7d',           // 主品牌色 - 深蓝
        light: '#3a4ca7',             // 主色浅色变体
        dark: '#1e2d5f'               // 主色深色变体
    },

    // 辅助色
    secondary: {
        DEFAULT: '#36CFC9',           // 辅助色 - 青色
        light: '#5ED9D4',
        dark: '#2AB5AF'
    },

    // 强调色
    accent: {
        DEFAULT: '#722ED1',           // 强调色 - 紫色
        light: '#8F4DE8',
        dark: '#5A1FB0'
    }
}
```

| 色彩名称 | 色值 | CSS变量 | 使用场景 |
|----------|------|---------|----------|
| Primary | `#2a3b7d` | `--color-primary` | 主按钮、导航栏、重点文字 |
| Primary Light | `#3a4ca7` | `--color-primary-light` | 悬停状态、渐变背景 |
| Primary Dark | `#1e2d5f` | `--color-primary-dark` | 激活状态、深层背景 |
| Secondary | `#36CFC9` | `--color-secondary` | 辅助按钮、图标高亮 |
| Accent | `#722ED1` | `--color-accent` | 特殊强调、徽章 |

### 1.2 功能色（语义化颜色）

```javascript
// 功能色 - 用于表达状态和反馈
success: {
    DEFAULT: '#00B42A',
    light: '#33D161',
    dark: '#008F22',
    bg: '#E8FFEC',                    // 成功背景色
    text: '#006B19'                   // 成功文字色
},

warning: {
    DEFAULT: '#FF7D00',
    light: '#FF9933',
    dark: #CC6400',
    bg: '#FFF7E8',                    // 警告背景色
    text: '#994D00'                   // 警告文字色
},

danger: {
    DEFAULT: '#F53F3F',
    light: '#F97070',
    dark: '#C33232',
    bg: '#FFECE8',                    // 错误背景色
    text: '#B3261E'                   // 错误文字色
},

info: {
    DEFAULT: '#1677FF',
    light: '#4096FF',
    dark: '#0E5FCC',
    bg: '#E8F3FF',                    // 信息背景色
    text: '#094D8C'                   // 信息文字色
}
```

| 状态类型 | 色值 | 背景色 | 文字色 | 使用场景 |
|----------|------|--------|--------|----------|
| 成功 | `#00B42A` | `#E8FFEC` | `#006B19` | 成功提示、启用状态 |
| 警告 | `#FF7D00` | `#FFF7E8` | `#994D00` | 警告提示、待处理状态 |
| 危险 | `#F53F3F` | `#FFECE8` | `#B3261E` | 错误提示、删除按钮、禁用状态 |
| 信息 | `#1677FF` | `#E8F3FF` | `#094D8C` | 信息提示、链接 |

### 1.3 中性色（Neutral Colors）

```javascript
neutral: {
    50: '#FAFAFA',                    // 最浅灰 - 页面背景
    100: '#F5F5F5',                   // 浅灰 - 卡片背景
    200: '#E5E7EB',                   // 边框颜色
    300: '#D1D5DB',                   // 禁用边框
    400: '#9CA3AF',                   // 占位符文字
    500: '#6B7280',                   // 次要文字
    600: '#4B5563',                   // 常规文字
    700: '#374151',                   // 标题文字
    800: '#1F2937',                   // 重要文字
    900: '#111827',                   //最深色 - 主标题
    DEFAULT: '#1D2129'                // 默认深色文字
}

dark: '#1D2129',                      // 深色文字（兼容旧版）
border: '#E5E7EB',                    // 边框颜色（兼容旧版）
light-bg: '#FFFFFF',                  // 浅色背景（兼容旧版）
card-bg: '#FFFFFF'                    // 卡片背景（兼容旧版）
```

| 中性色阶 | 色值 | 使用场景 |
|----------|------|----------|
| Neutral-50 | `#FAFAFA` | 页面整体背景 |
| Neutral-100 | `#F5F5F5` | 次级卡片背景、悬停状态 |
| Neutral-200 | `#E5E7EB` | 边框、分割线 |
| Neutral-300 | `#D1D5DB` | 禁用状态边框 |
| Neutral-400 | `#9CA3AF` | 占位符文字、辅助信息 |
| Neutral-500 | `#6B7280` | 次要文字、描述文本 |
| Neutral-600 | `#4B5563` | 常规正文文字 |
| Neutral-700 | `#374151` | 小标题、重要文字 |
| Neutral-800 | `#1F2937` | 大标题、强调文字 |
| Neutral-900 | `#111827` | 主标题、品牌文字 |

---

## 2. 字体规范（Typography）

### 2.1 字体家族

```javascript
fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
}
```

**字体栈优先级**：
1. **Inter** (Google Fonts) - 主要UI字体，清晰易读
2. **system-ui** - 操作系统默认字体
3. **-apple-system** - Apple设备优化
4. **sans-serif** - 最终回退

### 2.2 字号系统

```javascript
fontSizes: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - 极小文字
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px - 小字/辅助文字
    base: ['0.95rem', { lineHeight: '1.5rem' }],    // 15px - 正文（默认）
    lg: ['1rem', { lineHeight: '1.5rem' }],         // 16px - 大正文
    xl: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px - 小标题
    '2xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - 中标题
    '3xl': ['1.4rem', { lineHeight: '2rem' }],       // 22px - 区块标题
    '4xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px - 大标题
    '5xl': ['2rem', { lineHeight: '2.25rem' }],       // 32px - 页面主标题
    '6xl': ['2.5rem', { lineHeight: '1' }],          // 40px - 展示标题
}
```

| 字号等级 | 值 | 像素 | 行高 | 使用场景 |
|----------|-----|------|------|----------|
| xs | 0.75rem | 12px | 16px | 标签、版权信息、极小辅助文字 |
| sm | 0.875rem | 14px | 20px | 表格内容、辅助文字、按钮文字 |
| base | 0.95rem | 15px | 24px | 正文内容（默认字号） |
| lg | 1rem | 16px | 24px | 大正文、重要段落 |
| xl | 1.125rem | 18px | 28px | 小标题、卡片标题 |
| 2xl | 1.25rem | 20px | 28px | 中标题、模态框标题 |
| 3xl | 1.4rem | 22px | 32px | 区块标题、页面副标题 |
| 4xl | 1.875rem | 30px | 36px | 大标题 |
| 5xl | 2rem | 32px | 36px | 页面主标题 |
| 6xl | 2.5rem | 40px | 40px | 展示型大标题 |

### 2.3 字重（Font Weight）

```javascript
fontWeight: {
    normal: '400',                     // 常规
    medium: '500',                     // 中等（推荐用于标题）
    semibold: '600',                   // 半粗（推荐用于强调）
    bold: '700'                        // 粗体
}
```

| 字重 | 值 | 使用场景 |
|------|-----|----------|
| Normal | 400 | 正文内容 |
| Medium | 500 | 次级标题、按钮文字 |
| Semibold | 600 | 主要标题、导航项（推荐） |
| Bold | 700 | 强调文字、数字展示 |

---

## 3. 间距系统（Spacing）

采用 **4px 基础网格** 系统，所有间距为 4 的倍数。

```javascript
spacing: {
    0: '0',                            // 0px
    0.5: '0.125rem',                  // 2px - 微调
    1: '0.25rem',                     // 4px - 紧凑间距
    1.5: '0.375rem',                  // 6px - 微间距
    2: '0.5rem',                      // 8px - 小间距
    2.5: '0.625rem',                  // 10px - 特殊调整
    3: '0.75rem',                     // 12px - 内部元素间距
    4: '1rem',                        // 16px - 标准间距（最常用）
    5: '1.25rem',                     // 20px - 中等间距
    6: '1.5rem',                      // 24px - 大间距
    8: '2rem',                        // 32px - 区块间距
    10: '2.5rem',                     // 40px - 大区块间距
    12: '3rem',                       // 48px - 章节间距
    16: '4rem',                       // 64px - 页面级间距
    20: '5rem',                       // 80px - 大屏间距
    24: '6rem',                       // 96px - 特大间距
}
```

| 间距等级 | 值 | 像素 | 使用场景 |
|----------|-----|------|----------|
| xs (1) | 0.25rem | 4px | 图标与文字间距、紧凑布局 |
| sm (2) | 0.5rem | 8px | 小元素间距、表单字段间距 |
| md (3) | 0.75rem | 12px | 列表项间距、内部padding |
| base (4) | 1rem | 16px | 标准间距、卡片内边距（**最常用**） |
| lg (6) | 1.5rem | 24px | 区块间距、大组件外边距 |
| xl (8) | 2rem | 32px | 章节间距、主要区块分隔 |
| 2xl (12) | 3rem | 48px | 页面章节间隔 |
| 3xl (16) | 4rem | 64px | 页面顶部/底部留白 |

---

## 4. 圆角规范（Border Radius）

```javascript
borderRadius: {
    none: '0',                         // 无圆角
    sm: '0.125rem',                   // 2px - 小圆角（标签、徽章）
    DEFAULT: '0.375rem',              // 6px - 默认圆角（输入框、小按钮）
    md: '0.5rem',                     // 8px - 中等圆角（卡片、按钮）
    lg: '0.75rem',                    // 12px - 大圆角（模态框、大卡片）
    xl: '1rem',                       // 16px - 超大圆角（特殊容器）
    '2xl': '1.5rem',                  // 24px - 全圆角胶囊形状
    full: '9999px'                    // 完全圆形（头像、圆形按钮）
}
```

| 圆角等级 | 值 | 像素 | 使用场景 |
|----------|-----|------|----------|
| None | 0 | 0px | 表格、直角卡片 |
| Sm | 0.125rem | 2px | 标签、徽章、极小元素 |
| Default | 0.375rem | 6px | 输入框、下拉框、小按钮（**默认值**） |
| Md | 0.5rem | 8px | 标准按钮、普通卡片（**常用**） |
| Lg | 0.75rem | 12px | 模态框、大卡片、重要容器 |
| Xl | 1rem | 16px | 特殊展示容器 |
| 2xl | 1.5rem | 24px | 胶囊形按钮、标签页 |
| Full | 9999px | 圆形 | 头像、圆形图标按钮 |

---

## 5. 阴影系统（Shadows）

```javascript
boxShadow: {
    // 基础阴影
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',                          // 微弱阴影
    DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',  // 默认阴影
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',  // 中等阴影
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',  // 大阴影
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',  // 超大阴影

    // 业务专用阴影
    card: '0 2px 8px rgba(0, 0, 0, 0.05)',                         // 卡片阴影
    'card-hover': '0 10px 25px -5px rgba(42, 59, 125, 0.1)',       // 卡片悬停阴影（带主色调）
    dropdown: '0 4px 16px rgba(0, 0, 0, 0.1)',                     // 下拉菜单阴影
    header: '0 2px 4px rgba(0, 0, 0, 0.05)',                       // 导航栏阴影
    modal: '0 20px 60px -15px rgba(0, 0, 0, 0.15)',                // 模态框阴影
    button: '0 2px 4px rgba(0, 0, 0, 0.08)'                        // 按钮阴影
}
```

| 阴影类型 | 视觉效果 | 使用场景 |
|----------|----------|----------|
| sm | 极微弱 | 内嵌元素、细微层次感 |
| card (默认) | 轻微浮起 | **标准卡片**（**最常用**） |
| md | 明显浮起 | 下拉菜单、弹出层 |
| card-hover | 带色调浮起 | 卡片悬停状态（交互反馈） |
| lg | 强烈浮起 | 模态框、重要弹窗 |
| header | 细线阴影 | 固定导航栏、头部 |

---

## 6. 过渡动画（Transitions）

```javascript
transitionDuration: {
    75: '75ms',                        // 极快（微交互）
    150: '150ms',                     // 快速（hover状态）
    300: '300ms',                     // 标准（展开/收起）
    500: '500ms',                     // 慢速（页面切换）
    700: '700ms',                     // 很慢（复杂动画）
    1000: '1000ms'                    // 极慢（特殊效果）
}

transitionTimingFunction: {
    'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',         // 平滑过渡（默认）
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',          // 缓入
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',         // 缓出
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // 弹跳效果
}
```

| 动画时长 | 时长 | 使用场景 |
|----------|------|----------|
| 75ms | 极快 | 按钮 hover、焦点变化 |
| 150ms | 快速 | 颜色渐变、简单状态切换 |
| 300ms | 标准 | 展开/收起、模态框出现/消失（**最常用**） |
| 500ms | 慢速 | 页面转场、复杂动画 |

---

## 7. 断点系统（Breakpoints）

响应式设计的断点定义：

```javascript
screens: {
    'sm': '640px',                    // 小屏幕 - 手机横屏
    'md': '768px',                    // 中等屏幕 - 平板竖屏
    'lg': '1024px',                   // 大屏幕 - 平板横屏/笔记本
    'xl': '1280px',                   // 超大屏幕 - 台式机
    '2xl': '1536px'                   // 2K屏幕 - 大屏显示器
}
```

| 断点 | 值 | 设备类型 | Tailwind前缀 |
|------|-----|----------|-------------|
| sm | ≥640px | 大屏手机/小平板 | `sm:` |
| md | ≥768px | 平板 | `md:` |
| lg | ≥1024px | 笔记本电脑 | `lg:` (**最常用**) |
| xl | ≥1280px | 台式机 | `xl:` |
| 2xl | ≥1536px | 2K显示器 | `2xl:` |

---

## 8. z-index 层级系统

```javascript
zIndex: {
    0: '0',                           // 默认层
    10: '10',                         // 下拉菜单
    20: '20',                         // 固定导航栏
    30: '30',                         // 弹出层
    40: '40',                         // 模态框遮罩
    50: '50',                         // 模态框内容
    60: '60',                         // Toast通知
    auto: 'auto'
}
```

| 层级 | z-index | 使用场景 |
|------|---------|----------|
| Dropdown | 10 | 下拉菜单、选择器 |
| Sticky | 20 | 固定定位的导航栏、侧边栏 |
| Overlay | 30 | 弹出层、气泡卡片 |
| Modal Backdrop | 40 | 模态框半透明背景 |
| Modal Content | 50 | 模态框主体内容 |
| Tooltip/Toast | 60 | 工具提示、全局通知 |

---

## 9. 完整 Tailwind 配置对象

可直接复制到项目中使用：

```javascript
const DESIGN_TOKENS = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2a3b7d',
                    light: '#3a4ca7',
                    dark: '#1e2d5f'
                },
                secondary: {
                    DEFAULT: '#36CFC9',
                    light: '#5ED9D4',
                    dark: '#2AB5AF'
                },
                accent: {
                    DEFAULT: '#722ED1',
                    light: '#8F4DE8',
                    dark: '#5A1FB0'
                },
                success: {
                    DEFAULT: '#00B42A',
                    light: '#33D161',
                    dark: '#008F22',
                    bg: '#E8FFEC',
                    text: '#006B19'
                },
                warning: {
                    DEFAULT: '#FF7D00',
                    light: '#FF9933',
                    dark: '#CC6400',
                    bg: '#FFF7E8',
                    text: '#994D00'
                },
                danger: {
                    DEFAULT: '#F53F3F',
                    light: '#F97070',
                    dark: '#C33232',
                    bg: '#FFECE8',
                    text: '#B3261E'
                },
                info: {
                    DEFAULT: '#1677FF',
                    light: '#4096FF',
                    dark: '#0E5FCC',
                    bg: '#E8F3FF',
                    text: '#094D8C'
                },
                neutral: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827'
                },
                dark: '#1D2129',
                border: '#E5E7EB',
                'light-bg': '#FFFFFF',
                'card-bg': '#FFFFFF'
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
                '5xl': ['2rem', { lineHeight: '2.25rem' }],
                '6xl': ['2.5rem', { lineHeight: '1' }]
            },
            spacing: {
                0: '0',
                0.5: '0.125rem',
                1: '0.25rem',
                1.5: '0.375rem',
                2: '0.5rem',
                2.5: '0.625rem',
                3: '0.75rem',
                4: '1rem',
                5: '1.25rem',
                6: '1.5rem',
                8: '2rem',
                10: '2.5rem',
                12: '3rem',
                16: '4rem',
                20: '5rem',
                24: '6rem'
            },
            borderRadius: {
                none: '0',
                sm: '0.125rem',
                DEFAULT: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
                full: '9999px'
            },
            boxShadow: {
                sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
                DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                card: '0 2px 8px rgba(0, 0, 0, 0.05)',
                'card-hover': '0 10px 25px -5px rgba(42, 59, 125, 0.1)',
                dropdown: '0 4px 16px rgba(0, 0, 0, 0.1)',
                header: '0 2px 4px rgba(0, 0, 0, 0.05)',
                modal: '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
                button: '0 2px 4px rgba(0, 0, 0, 0.08)'
            },
            transitionDuration: {
                75: '75ms',
                150: '150ms',
                300: '300ms',
                500: '500ms',
                700: '700ms',
                1000: '1000ms'
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
                'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
                'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
                bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            },
            screens: {
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px'
            },
            zIndex: {
                0: '0',
                10: '10',
                20: '20',
                30: '30',
                40: '40',
                50: '50',
                60: '60',
                auto: 'auto'
            }
        }
    }
};

module.exports = DESIGN_TOKENS;
```

---

## 🎨 CSS 变量版本（可选）

如需在纯CSS中使用，可引入以下CSS变量：

```css
:root {
    /* 色彩 */
    --color-primary: #2a3b7d;
    --color-primary-light: #3a4ca7;
    --color-primary-dark: #1e2d5f;
    --color-secondary: #36CFC9;
    --color-accent: #722ED1;

    --color-success: #00B42A;
    --color-warning: #FF7D00;
    --color-danger: #F53F3F;
    --color-info: #1677FF;

    /* 中性色 */
    --color-neutral-50: #FAFAFA;
    --color-neutral-100: #F5F5F5;
    --color-neutral-200: #E5E7EB;
    --color-border: #E5E7EB;
    --color-text: #1D2129;

    /* 间距 */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* 圆角 */
    --radius-sm: 0.125rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;

    /* 阴影 */
    --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.05);
    --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.1);

    /* 过渡 */
    --transition-fast: 150ms;
    --transition-normal: 300ms;
    --transition-slow: 500ms;
}
```

---

## ✅ 版本信息

| 项目 | 值 |
|------|-----|
| 版本 | v2.0.0 |
| 最后更新 | 2026-01-15 |
| 维护者 | TOB产品设计团队 |
| 兼容性 | Tailwind CSS 3.x+ |

---

## 📝 变更日志

### v2.0.0 (2026-01-15)
- ✨ 新增完整设计令牌系统
- ✨ 新增色彩语义化（成功/警告/危险/信息背景色）
- ✨ 新增中性色阶（Neutral 50-900）
- ✨ 新增完整的Tailwind配置对象
- 🔧 重构间距系统，基于4px网格
- 📚 新增使用示例和最佳实践
- 🐛 修复历史版本中的不一致问题

---

**⚠️ 重要提醒**：
1. 本文件是**唯一数据源**，其他文件应通过引用使用
2. 修改本文件会影响全局设计一致性，请谨慎操作
3. 建议每次修改后进行视觉回归测试

---

## 10. 响应式设计系统（v2.1 新增）

### 10.1 断点定义（Breakpoints）

基于现代设备尺寸的响应式断点系统：

```javascript
screens: {
    'xs': '0px',                       // 超小屏 - 手机竖屏（默认）
    'sm': '640px',                     // 小屏 - 手机横屏/大屏手机
    'md': '768px',                     // 中屏 - 平板竖屏
    'lg': '1024px',                    // 大屏 - 平板横屏/笔记本（**最常用**）
    'xl': '1280px',                    // 超大屏 - 台式机
    '2xl': '1536px'                    // 2K屏 - 大屏显示器
}
```

| 断点名称 | 最小宽度 | 设备类型 | Tailwind类前缀 | 典型场景 |
|----------|----------|----------|----------------|----------|
| **xs** | 0px | 手机竖屏 | （默认） | 移动端优先基础布局 |
| **sm** | ≥640px | 手机横屏 | `sm:` | 大屏手机、紧凑布局 |
| **md** | ≥768px | 平板竖屏 | `md:` | 平板设备、双列布局 |
| **lg** | ≥1024px | 笔记本 | `lg:` | **桌面端标准布局** |
| **xl** | ≥1280px | 台式机 | `xl:` | 宽屏桌面、三列布局 |
| **2xl** | ≥1536px | 2K显示器 | `2xl:` | 超宽屏、数据密集型界面 |

### 10.2 响应式间距调整

不同断点下的推荐间距策略：

```css
/* 移动端（xs/sm）- 紧凑间距 */
.container {
    padding: var(--spacing-3);         /* 12px */
    gap: var(--spacing-2);             /* 8px */
}

/* 平板端（md/lg）- 标准间距 */
@media (min-width: 768px) {
    .container {
        padding: var(--spacing-4);     /* 16px */
        gap: var(--spacing-4);         /* 16px */
    }
}

/* 桌面端（xl/2xl）- 宽松间距 */
@media (min-width: 1280px) {
    .container {
        padding: var(--spacing-6);     /* 24px */
        gap: var(--spacing-6);         /* 24px */
        max-width: 1400px;             /* 限制最大宽度 */
        margin: 0 auto;                /* 居中 */
    }
}
```

### 10.3 响应式字体大小

```css
/* 移动端优先的字号系统 */
.heading-1 {
    font-size: var(--font-size-3xl);   /* 22px - 移动端 */

    @media (min-width: 768px) {
        font-size: var(--font-size-4xl);  /* 30px - 平板及以上 */
    }

    @media (min-width: 1280px) {
        font-size: var(--font-size-5xl);  /* 32px - 桌面端 */
    }
}

.body-text {
    font-size: var(--font-size-sm);    /* 14px - 移动端 */

    @media (min-width: 768px) {
        font-size: var(--font-size-base);  /* 15px - 平板及以上 */
    }
}
```

### 10.4 响应式网格系统

```css
/* 自适应列数 */
.grid-responsive {
    display: grid;
    grid-template-columns: 1fr;         /* 移动端：单列 */
    gap: var(--spacing-4);

    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);  /* sm：双列 */
    }

    @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);  /* lg：三列 */
    }

    @media (min-width: 1280px) {
        grid-template-columns: repeat(4, 1fr);  /* xl：四列 */
    }
}
```

### 10.5 隐藏/显示规则

```css
/* 移动端隐藏，桌面端显示 */
.hide-mobile {
    display: none;

    @media (min-width: 1024px) {
        display: block;
    }
}

/* 桌面端隐藏，移动端显示 */
.hide-desktop {
    display: block;

    @media (min-width: 1024px) {
        display: none;
    }
}
```

---

## 11. 暗色模式系统（v2.1 新增框架）

> ⚠️ **注意**：暗色模式为可选功能，以下为基础框架。完整实现需根据业务需求定制。

### 11.1 实现方式选择

| 方式 | 实现难度 | 用户控制 | 推荐场景 |
|------|----------|----------|----------|
| **系统跟随** | ⭐ 简单 | ❌ 无法切换 | 工具类应用、内部系统 |
| **手动切换** | ⭐⭐ 中等 | ✅ 完全控制 | 面向用户的产品 |
| **混合模式** | ⭐⭐⭐ 复杂 | ✅✅ 最佳体验 | 企业级SaaS产品 |

### 11.2 CSS 变量覆盖方案（系统跟随）

```css
/* 默认亮色主题（Light Theme） */
:root {
    /* ===== 品牌色 ===== */
    --color-primary: #2a3b7d;
    --color-primary-light: #3a4ca7;
    --color-primary-dark: #1e2d5f;

    --color-secondary: #36CFC9;
    --color-accent: #722ED1;

    /* ===== 功能色 ===== */
    --color-success: #00B42A;
    --color-warning: #FF7D00;
    --color-danger: #F53F3F;
    --color-info: #1677FF;

    /* 功能色背景和文字 */
    --color-success-bg: #E8FFEC;
    --color-success-text: #006B19;
    --color-warning-bg: #FFF7E8;
    --color-warning-text: #994D00;
    --color-danger-bg: #FFECE8;
    --color-danger-text: #B3261E;
    --color-info-bg: #E8F3FF;
    --color-info-text: #094D8C;

    /* ===== 中性色 ===== */
    --color-neutral-50: #FAFAFA;
    --color-neutral-100: #F5F5F5;
    --color-neutral-200: #E5E7EB;
    --color-neutral-300: #D1D5DB;
    --color-neutral-400: #9CA3AF;
    --color-neutral-500: #6B7280;
    --color-neutral-600: #4B5563;
    --color-neutral-700: #374151;
    --color-neutral-800: #1F2937;
    --color-neutral-900: #111827;

    /* ===== 语义化变量 ===== */
    --border-color: #E5E7EB;
    --color-card-bg: #FFFFFF;
    --color-light-bg: #FFFFFF;
    --color-dark: #1D2129;
    --color-text-primary: #1F2937;
    --color-text-secondary: #6B7280;
    --color-text-muted: #9CA3AF;

    /* ===== 阴影（亮色模式更柔和）===== */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-default: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 暗色主题（Dark Theme）- 自动跟随系统 */
@media (prefers-color-scheme: dark) {
    :root {
        /* ===== 品牌色（提高亮度以适配深色背景）===== */
        --color-primary: #5B8DEF;
        --color-primary-light: #7AA3F5;
        --color-primary-dark: #4A7BD9;

        --color-secondary: #5ED9D4;
        --color-accent: #A37BE0;

        /* ===== 功能色（保持不变或微调）===== */
        --color-success: #33D161;
        --color-warning: #FF9933;
        --color-danger: #F97070;
        --color-info: #4096FF;

        /* 功能色背景（深色版本）*/
        --color-success-bg: #1A3D1F;
        --color-success-text: #4ADE80;
        --color-warning-bg: #3D2E0F;
        --color-warning-text: #FBBF24;
        --color-danger-bg: #3D1515;
        --color-danger-text: #F87171;
        --color-info-bg: #172744;
        --color-info-text: #60A5FA;

        /* ===== 中性色（反转）===== */
        --color-neutral-50: #111827;
        --color-neutral-100: #1F2937;
        --color-neutral-200: #374151;
        --color-neutral-300: #4B5563;
        --color-neutral-400: #6B7280;
        --color-neutral-500: #9CA3AF;
        --color-neutral-600: #D1D5DB;
        --color-neutral-700: #E5E7EB;
        --color-neutral-800: #F3F4F6;
        --color-neutral-900: #F9FAFB;

        /* ===== 语义化变量（暗色版）===== */
        --border-color: #374151;
        --color-card-bg: #1F2937;
        --color-light-bg: #111827;
        --color-dark: #F9FAFB;
        --color-text-primary: #F9FAFB;
        --color-text-secondary: #D1D5DB;
        --color-text-muted: #9CA3AF;

        /* ===== 阴影（暗色模式更深）===== */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
        --shadow-default: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
    }
}
```

### 11.3 手动切换实现方案

```html
<!-- HTML：暗色模式切换按钮 -->
<button id="theme-toggle" onclick="toggleDarkMode()" title="切换主题">
    <i class="fas fa-sun" id="theme-icon-light"></i>
    <i class="fas fa-moon" id="theme-icon-dark" style="display:none"></i>
</button>
```

```javascript
// JavaScript：主题切换逻辑
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon(false);
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(true);
    }

    // 触发主题变更事件
    window.dispatchEvent(new CustomEvent('themeChange', {
        detail: { theme: isDark ? 'light' : 'dark' }
    }));
}

function updateThemeIcon(isDark) {
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    if (lightIcon && darkIcon) {
        lightIcon.style.display = isDark ? 'none' : 'inline-block';
        darkIcon.style.display = isDark ? 'inline-block' : 'none';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', initTheme);

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        toggleDarkMode();
    }
});
```

```css
/* CSS：基于 data-theme 属性的主题切换 */
[data-theme="dark"] {
    /* 复用上方暗色模式的CSS变量定义 */
    --color-primary: #5B8DEF;
    /* ... 其他变量同上 ... */
}

[data-theme="light"] {
    /* 使用默认的 :root 变量即可 */
}
```

### 11.4 暗色模式适配要点

#### 必须适配的组件：
- ✅ **卡片/容器**：背景色从白色改为深灰色
- ✅ **文字**：确保对比度符合 WCAG AA 标准（≥4.5:1）
- ✅ **边框**：降低边框亮度，避免刺眼
- ✅ **阴影**：加深阴影以在深色背景上可见
- ✅ **图标**：使用浅色图标或反转颜色

#### 可选优化的组件：
- 🔧 **图表**：调整配色方案以适配深色背景
- 🔧 **图片**：可适当降低亮度或添加遮罩
- 🔧 **代码块**：使用深色代码高亮主题
- 🔧 **表格**：斑马纹颜色调整为深色调

#### 不建议修改的组件：
- ❌ **品牌Logo**：保持原色以确保识别度
- ❌ **状态色**：成功/警告/危险等语义化颜色保持不变

### 11.5 暗色模式测试清单

- [ ] 所有页面在暗色模式下可正常阅读
- [ ] 文字对比度符合无障碍标准（工具：Chrome DevTools Contrast Checker）
- [ ] 输入框聚焦状态清晰可见
- [ ] 表格斑马纹不会与行悬停冲突
- [ ] 模态框遮罩层透明度适中
- [ ] Toast通知在不同背景下都清晰可见
- [ ] 图片和插画不会过曝或过暗
- [ ] 图表和数据可视化元素清晰可读
- [ ] 主题切换动画流畅（≤300ms）
- [ ] LocalStorage 正确保存用户偏好

---

## 📊 设计令牌快速参考卡

### 核心色彩速查

| 用途 | 亮色模式 | 暗色模式 | CSS变量 |
|------|----------|----------|---------|
| 主色调 | `#2a3b7d` | `#5B8DEF` | `--color-primary` |
| 成功 | `#00B42A` | `#33D161` | `--color-success` |
| 警告 | `#FF7D00` | `#FF9933` | `--color-warning` |
| 危险 | `#F53F3F` | `#F97070` | `--color-danger` |
| 信息 | `#1677FF` | `#4096FF` | `--color-info` |

### 常用间距速查

| 场景 | 值 | CSS变量 |
|------|-----|---------|
| 元素内部紧凑 | 8px | `var(--spacing-2)` |
| 标准内边距 | 16px | `var(--spacing-4)` |
| 区块间距 | 24px | `var(--spacing-6)` |
| 章节分隔 | 48px | `var(--spacing-12)` |

### 动画时长速查

| 场景 | 时长 | CSS变量 |
|------|------|---------|
| 按钮 hover | 150ms | `var(--duration-150)` |
| 展开/收起 | 300ms | `var(--duration-300)` |
| 页面转场 | 500ms | `var(--duration-500)` |

---

## 🔧 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| **v2.1** | 2026-01-18 | **第3批优化**：新增响应式设计系统（断点/间距/字体/网格）、新增完整暗色模式框架（双方案实现）、新增快速参考卡 |
| v2.0 | 2026-01-15 | **重大更新**：重构为设计令牌系统、新增语义化色彩、中性色阶、Tailwind配置对象、4px网格间距系统 |
| v1.0 | 2026-01-13 | 初始版本，基础色彩和字体规范 |
