# 模态框组件

完整的模态框组件规范，包含样式、HTML模板、JavaScript逻辑和使用示例。

## 基础样式

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    max-width: 90%;
    max-height: 90vh;
    overflow: hidden;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content {
    transform: scale(1);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: var(--color-neutral-500);
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
}

.close-btn:hover {
    color: var(--color-neutral-700);
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: calc(90vh - 200px);
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}
```

## HTML模板

### 基础模态框

```html
<div id="modal-basic" class="modal-overlay" onclick="closeModalOnOverlay(event)">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">模态框标题</h3>
            <button class="close-btn" onclick="closeModal('modal-basic')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <p class="text-sm text-neutral-600">模态框内容区域...</p>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('modal-basic')">取消</button>
            <button class="erp-btn erp-btn-primary">确认</button>
        </div>
    </div>
</div>
```

### 确认对话框

```html
<div id="confirm-modal" class="modal-overlay">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h3 class="modal-title">确认操作</h3>
        </div>
        <div class="modal-body">
            <div class="text-center py-4">
                <i class="fa fa-exclamation-triangle text-4xl text-warning mb-4"></i>
                <p class="text-gray-600">确定要执行此操作吗？此操作不可撤销。</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('confirm-modal')">取消</button>
            <button class="erp-btn erp-btn-danger">确认删除</button>
        </div>
    </div>
</div>
```

### 表单模态框

```html
<div id="form-modal" class="modal-overlay">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h3 class="modal-title">新增/编辑</h3>
            <button class="close-btn" onclick="closeModal('form-modal')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <!-- 表单内容 -->
            <form id="dataForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">字段名称</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('form-modal')">取消</button>
            <button class="erp-btn erp-btn-primary">保存</button>
        </div>
    </div>
</div>
```

## JavaScript逻辑

### 模态框管理函数

```javascript
/**
 * 打开模态框
 * @param {string} modalId - 模态框元素ID，默认为 'formModal'
 */
function openModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 关闭模态框
 * @param {string} modalId - 模态框元素ID，默认为 'formModal'
 */
function closeModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * 点击遮罩层关闭模态框
 * @param {Event} event - 点击事件对象
 */
function closeModalOnOverlay(event) {
    if (event.target === event.currentTarget) {
        event.target.classList.remove('show');
        document.body.style.overflow = '';
    }
}
```

### 使用示例

```javascript
// 打开添加模态框
openModal('addModal');

// 关闭编辑模态框
closeModal('editModal');

// 打开确认对话框
openModal('confirm-modal');

// 关闭所有模态框
document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
    modal.classList.remove('show');
});
document.body.style.overflow = '';
```

## 使用规范

1. **模态框ID**：每个模态框必须有唯一的ID
2. **遮罩层点击**：支持点击遮罩层关闭，提升用户体验
3. **滚动锁定**：打开模态框时锁定body滚动，关闭时恢复
4. **按钮布局**：取消按钮在左，确认按钮在右
5. **响应式**：最大宽度90%，适配移动端
6. **无障碍**：使用语义化标签，支持键盘操作（ESC关闭）

## 高级用法

### 动态创建模态框

```javascript
function createDynamicModal(title, content, onConfirm) {
    const modalId = 'dynamic-modal-' + Date.now();
    const modalHTML = `
        <div id="${modalId}" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="close-btn" onclick="closeModal('${modalId}')">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    <button class="erp-btn erp-btn-secondary" onclick="closeModal('${modalId}')">取消</button>
                    <button class="erp-btn erp-btn-primary" id="${modalId}-confirm">确认</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const confirmBtn = document.getElementById(`${modalId}-confirm`);
    if (confirmBtn && onConfirm) {
        confirmBtn.addEventListener('click', function() {
            onConfirm();
            closeModal(modalId);
            document.getElementById(modalId).remove();
        });
    }

    openModal(modalId);
}
```
