# Mermaid 模态框

Mermaid 流程图的放大查看功能。

## 方法

```javascript
function openMermaidModal(container)
function closeMermaidModal(event)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `container` | `Element` | 包含 .mermaid 的容器元素 |
| `event` | `Event` | 点击事件（用于判断点击目标） |

## 完整代码

```javascript
function openMermaidModal(container) {
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    var modal = document.getElementById('mermaidModal');
    var content = document.getElementById('mermaidModalContent');
    if (!modal || !content) return;
    
    content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
    modal.classList.add('show');
    if (typeof mermaid !== 'undefined') {
        try {
            mermaid.init(undefined, content.querySelector('.mermaid'));
        } catch (e) {
            console.warn('mermaid init', e);
        }
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('show');
}
```

## 使用示例

```html
<div class="mermaid-container" onclick="openMermaidModal(this)">
    <div class="mermaid">graph TD A-->B</div>
    <span class="mermaid-hint">点击放大</span>
</div>

<div class="modal" id="mermaidModal" onclick="closeMermaidModal(event)">
    <div class="modal-content" id="mermaidModalContent"></div>
</div>
```

## 依赖

- `mermaid.js`：流程图渲染库