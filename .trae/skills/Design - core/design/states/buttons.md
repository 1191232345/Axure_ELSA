# 按钮交互状态

主按钮 + 次要按钮 + 危险按钮 + 警告按钮 + 成功按钮。

```css
.erp-btn-primary {
    background-color: var(--color-primary);
    color: var(--color-neutral-50);
    border-color: var(--color-primary);
    transition: all var(--duration-150) var(--ease-smooth);
}
.erp-btn-primary:hover { background-color: var(--color-primary-light); border-color: var(--color-primary-light); opacity: 0.9; transform: translateY(-1px); box-shadow: var(--shadow-button); }
.erp-btn-primary:active { transform: translateY(0); opacity: 0.8; }
.erp-btn-primary:disabled { background-color: var(--color-neutral-400); border-color: var(--color-neutral-400); cursor: not-allowed; opacity: 0.6; transform: none; box-shadow: none; }
.erp-btn-primary.loading { position: relative; color: transparent; pointer-events: none; }
.erp-btn-primary.loading::after { content: ''; position: absolute; width: 16px; height: 16px; border: 2px solid var(--color-neutral-50); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }

.erp-btn-secondary {
    background-color: var(--color-card-bg);
    color: var(--color-neutral-600);
    border-color: var(--border-color);
    transition: all var(--duration-150) var(--ease-smooth);
}
.erp-btn-secondary:hover { border-color: var(--color-neutral-300); color: var(--color-dark); transform: translateY(-1px); box-shadow: var(--shadow-button); }
.erp-btn-secondary:active { transform: translateY(0); }
.erp-btn-secondary:disabled { background-color: var(--color-neutral-100); color: var(--color-neutral-400); border-color: var(--color-neutral-200); cursor: not-allowed; transform: none; box-shadow: none; }

.erp-btn-danger {
    background-color: var(--color-danger);
    color: var(--color-neutral-50);
    border-color: var(--color-danger);
    transition: all var(--duration-150) var(--ease-smooth);
}
.erp-btn-danger:hover { background-color: var(--color-danger-light, #F97070); border-color: var(--color-danger-light, #F97070); transform: translateY(-1px); box-shadow: var(--shadow-button); }
.erp-btn-danger:active { transform: translateY(0); }
.erp-btn-danger:disabled { background-color: var(--color-danger-bg, #FFECE8); border-color: var(--color-danger-bg, #FFECE8); color: var(--color-danger-text, #B3261E); cursor: not-allowed; transform: none; box-shadow: none; }

.erp-btn-warning { background-color: var(--color-warning); color: var(--color-neutral-50); border-color: var(--color-warning); transition: all var(--duration-150) var(--ease-smooth); }
.erp-btn-warning:hover { background-color: var(--color-warning-light, #FF9933); border-color: var(--color-warning-light, #FF9933); transform: translateY(-1px); box-shadow: var(--shadow-button); }
.erp-btn-warning:active { transform: translateY(0); }
.erp-btn-warning:disabled { background-color: var(--color-warning-bg, #FFF7E8); border-color: var(--color-warning-bg, #FFF7E8); color: var(--color-warning-text, #994D00); cursor: not-allowed; transform: none; box-shadow: none; }

.erp-btn-success { background-color: var(--color-success); color: var(--color-neutral-50); border-color: var(--color-success); transition: all var(--duration-150) var(--ease-smooth); }
.erp-btn-success:hover { background-color: var(--color-success-light, #33D161); border-color: var(--color-success-light, #33D161); transform: translateY(-1px); box-shadow: var(--shadow-button); }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
```
