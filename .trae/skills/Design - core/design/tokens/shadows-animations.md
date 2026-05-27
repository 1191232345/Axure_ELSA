# 阴影与动画

阴影系统 + 过渡动画。

## 阴影系统

| 类型 | 值 | 使用场景 |
|------|-----|----------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | 微弱阴影 |
| DEFAULT | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | 默认阴影 |
| card | `0 2px 8px rgba(0,0,0,0.05)` | **标准卡片**（最常用） |
| card-hover | `0 10px 25px -5px rgba(42,59,125,0.1)` | 卡片悬停 |
| dropdown | `0 4px 16px rgba(0,0,0,0.1)` | 下拉菜单 |
| modal | `0 20px 60px -15px rgba(0,0,0,0.15)` | 模态框 |
| button | `0 2px 4px rgba(0,0,0,0.08)` | 按钮 |

## 过渡动画

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

## Tailwind 配置

```javascript
boxShadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    card: '0 2px 8px rgba(0,0,0,0.05)',
    'card-hover': '0 10px 25px -5px rgba(42,59,125,0.1)',
    dropdown: '0 4px 16px rgba(0,0,0,0.1)',
    header: '0 2px 4px rgba(0,0,0,0.05)',
    modal: '0 20px 60px -15px rgba(0,0,0,0.15)',
    button: '0 2px 4px rgba(0,0,0,0.08)'
},
transitionDuration: { 75: '75ms', 150: '150ms', 300: '300ms', 500: '500ms' },
transitionTimingFunction: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}
```
