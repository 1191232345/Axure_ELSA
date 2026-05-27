# 公共表单与模态框样式

```css
.form-group { margin-bottom: 16px; }
.form-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: var(--color-text-primary); }

.form-input {
    width: 100%; padding: 8px 12px; font-size: 14px;
    border: 1px solid var(--color-border); border-radius: var(--radius-md);
    transition: border-color var(--duration-200), box-shadow var(--duration-200);
}
.form-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(42,59,125,0.1); }
.form-input:disabled { background: #f3f4f6; cursor: not-allowed; }

.modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
.modal.show { display: flex; }

.modal-content { background: white; border-radius: var(--radius-lg); width: 90%; max-width: 500px; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.modal-close { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; padding: 4px; }
.modal-close:hover { color: var(--color-text-primary); }
.modal-body { padding: 20px; overflow-y: auto; max-height: calc(90vh - 140px); }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--color-border); background: #f9fafb; }
```
