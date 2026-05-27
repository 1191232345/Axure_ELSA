# 设计令牌（Design Tokens）

统一设计令牌索引，代码拆分到 `tokens/` 子目录。

> **唯一数据源**：所有模板文件应引用本索引，禁止重复定义设计变量。

## 子文件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [colors](tokens/colors.md) | 色彩系统（品牌/功能/中性） | ~80 |
| [typography](tokens/typography.md) | 字体（家族/字号/字重） | ~70 |
| [spacing](tokens/spacing.md) | 间距 + 圆角 | ~60 |
| [shadows-animations](tokens/shadows-animations.md) | 阴影 + 过渡动画 | ~80 |
| [layout](tokens/layout.md) | 断点 + z-index | ~40 |
| [tailwind-config](tokens/tailwind-config.md) | 完整Tailwind配置对象 | ~40 |

## Top 5 速查

| 变量 | 值 | 场景 |
|------|-----|------|
| `--color-primary` | `#2a3b7d` | 主按钮、导航 |
| `--color-danger` | `#F53F3F` | 错误、删除 |
| `--color-success` | `#00B42A` | 成功、启用 |
| `--border-color` | `#E5E7EB` | 边框、分割线 |
| `--shadow-card` | `0 2px 8px rgba(0,0,0,0.05)` | 卡片阴影 |

## 使用方式

- 查变量 → 读对应子文件
- 复制配置 → 读 [tailwind-config](tokens/tailwind-config.md)
- 速查 → 本文件 Top 5 表格
