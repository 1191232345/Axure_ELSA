# 布局与层级

响应式断点 + z-index层级。

## 断点系统

| 断点 | 值 | 设备 | Tailwind前缀 |
|------|-----|------|-------------|
| sm | ≥640px | 大屏手机 | `sm:` |
| md | ≥768px | 平板 | `md:` |
| lg | ≥1024px | 笔记本 | `lg:`（**最常用**） |
| xl | ≥1280px | 台式机 | `xl:` |
| 2xl | ≥1536px | 2K显示器 | `2xl:` |

## z-index 层级

| 层级 | z-index | 使用场景 |
|------|---------|----------|
| Dropdown | 10 | 下拉菜单 |
| Sticky | 20 | 固定导航栏 |
| Overlay | 30 | 弹出层 |
| Modal Backdrop | 40 | 模态框遮罩 |
| Modal Content | 50 | 模态框内容 |
| Toast | 60 | 全局通知 |

## Tailwind 配置

```javascript
screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
zIndex: { 0: '0', 10: '10', 20: '20', 30: '30', 40: '40', 50: '50', 60: '60', auto: 'auto' }
```
