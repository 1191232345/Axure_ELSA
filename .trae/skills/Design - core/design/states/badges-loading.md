# 徽章与加载状态

状态徽章 + 旋转/脉冲动画 + 骨架屏。

```css
.status-badge-success { background-color: var(--color-success-bg, #E8FFEC); color: var(--color-success-text, #006B19); }
.status-badge-danger { background-color: var(--color-danger-bg, #FFECE8); color: var(--color-danger-text, #B3261E); }
.status-badge-warning { background-color: var(--color-warning-bg, #FFF7E8); color: var(--color-warning-text, #994D00); }
.status-badge-info { background-color: var(--color-info-bg, #E8F3FF); color: var(--color-info-text, #094D8C); }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

.skeleton {
    background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: var(--radius-default);
}
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.skeleton-text { height: var(--font-size-base); margin-bottom: var(--spacing-2); }
.skeleton-title { height: var(--font-size-xl); width: 60%; margin-bottom: var(--spacing-3); }
.skeleton-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
```
