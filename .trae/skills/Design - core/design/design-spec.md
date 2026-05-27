# 核心设计规范（v2.2 精简版 - 5分钟速查卡）

> **⚠️ 重要提示**：本文件仅提供**最常用的10个设计变量**快速参考。
>
> 📖 **完整设计令牌定义**（色彩/字体/间距/圆角/阴影/响应式/暗色模式）请查看：
> 👉 **[00-design-tokens.md](00-design-tokens.md)** （唯一数据源）

---

## 🎨 Top 10 最常用变量速查

| 优先级 | 类型 | 变量名 | 值 | 使用场景 |
|:------:|------|--------|-----|----------|
| ⭐⭐⭐ | **主品牌色** | `--color-primary` | `#2a3b7d` | 按钮、导航、标题、重点文字 |
| ⭐⭐⭐ | **成功色** | `--color-success` | `#00B42A` | 成功提示、启用状态、正向操作 |
| ⭐⭐⭐ | **危险色** | `--color-danger` | `#F53F3F` | 错误提示、删除操作、禁用状态 |
| ⭐⭐ | **警告色** | `--color-warning` | `#FF7D00` | 警告提示、待处理状态 |
| ⭐⭐ | **辅助色** | `--color-secondary` | `#36CFC9` | 辅助按钮、图标高亮、标签 |
| ⭐⭐ | **正文颜色** | `--color-text-primary` | `#1D2129` | 正文内容、表格文字 |
| ⭐⭐ | **边框颜色** | `--color-border` | `#E5E7EB` | 表格边框、分割线、输入框 |
| ⭐ | **背景白色** | `--color-card-bg` | `#FFFFFF` | 卡片背景、模态框、弹窗 |
| ⭐ | **标准间距** | `--spacing-4` | `1rem (16px)` | 卡片内边距（**最常用**）|
| ⭐ | **标准圆角** | `--radius-md` | `6px` | 按钮圆角、输入框、小卡片 |

---

## 🔤 字体 / 📏 间距 / ⚡ 动画

> 以下内容已统一至 [00-design-tokens.md](00-design-tokens.md)，此处不再重复。
>
> 快速链接：
> - 字体系统 → [00-design-tokens.md §3](00-design-tokens.md)
> - 间距系统 → [00-design-tokens.md §4](00-design-tokens.md)
> - 动画时长 → [00-design-tokens.md §7](00-design-tokens.md)

---

## 💡 Tailwind 配置引用

从 [00-design-tokens.md](00-design-tokens.md) 第9节复制完整配置对象：

```javascript
// tailwind.config.js
const DESIGN_TOKENS = {
    theme: {
        extend: {
            // 完整配置见 00-design-tokens.md
        }
    }
};
```

---

## 🚀 快速开始检查清单

创建新页面时，确保以下 **5 个核心变量** 已正确使用：

- [ ] 按钮和导航：`var(--color-primary)` ✅
- [ ] 成功/错误提示：`var(--color-success)` / `var(--color-danger)` ✅
- [ ] 文字颜色：`var(--color-text-primary)` ✅
- [ ] 边框和分割线：`var(--color-border)` ✅
- [ ] 卡片背景：`var(--color-card-bg)` ✅

---

## 📚 相关文档链接

| 文档 | 说明 | 适用场景 |
|------|------|----------|
| **[00-design-tokens.md](00-design-tokens.md)** | 完整设计令牌（**必读**） | 需要查找所有变量的详细定义 |
| [02-css-styles.md](02-css-styles.md) | CSS样式模板 | 编写具体CSS代码时参考 |
| [08-interaction-states.md](08-interaction-states.md) | 交互状态规范 | 定义按钮/表单的hover/focus/disabled状态 |

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v2.2** | 2026-05-22 | 进一步精简，字体/间距/动画表格改为引用 00-design-tokens.md |
| **v2.1** | 2026-01-18 | 精简为"5分钟速查卡"，仅保留Top 10最常用变量 |
| **v2.0** | 2026-01-15 | 初始版本 |
