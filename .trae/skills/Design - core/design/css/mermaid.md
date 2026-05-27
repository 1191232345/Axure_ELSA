# Mermaid 图表放大预览

```css
.mermaid { cursor: zoom-in; transition: transform 0.3s ease; }
.mermaid:hover { transform: scale(1.02); }

.mermaid-modal {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    justify-content: center;
    align-items: center;
    padding: 20px;
    backdrop-filter: blur(5px);
}

.mermaid-modal.active { display: flex; }

.mermaid-modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 95%; max-height: 95%;
    overflow: auto;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: modalZoomIn 0.3s ease-out;
}

@keyframes modalZoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}

.mermaid-modal-close {
    position: absolute;
    top: 15px; right: 15px;
    width: 40px; height: 40px;
    background: var(--color-neutral-100);
    border: none; border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    color: var(--color-neutral-700);
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
}

.mermaid-modal-close:hover {
    background: var(--border-color);
    transform: rotate(90deg);
}

.mermaid-hint {
    position: absolute;
    bottom: 10px; right: 15px;
    background: rgba(42, 59, 125, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}

.mermaid-container { position: relative; display: inline-block; }
.mermaid-container:hover .mermaid-hint { opacity: 1; }
```
