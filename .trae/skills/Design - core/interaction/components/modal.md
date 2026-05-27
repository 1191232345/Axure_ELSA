# 模态框组件

模态框模板，包含基础模态框、确认对话框、表单模态框。

## 基础模态框

```html
<div id="modal-[标识]" class="modal-overlay" onclick="closeModalOnOverlay(event)">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">[模态框标题]</h3>
            <button class="close-btn" onclick="closeModal('modal-[标识]')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <!-- 模态框内容 -->
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('modal-[标识]')">取消</button>
            <button class="erp-btn erp-btn-primary">确认</button>
        </div>
    </div>
</div>
```

## 确认对话框

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

## 表单模态框

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
            <!-- 表单内容，见 form.md -->
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('form-modal')">取消</button>
            <button class="erp-btn erp-btn-primary">保存</button>
        </div>
    </div>
</div>
```

## JavaScript

```javascript
function closeModalOnOverlay(event) {
    if (event.target === event.currentTarget) {
        event.target.classList.remove('show');
    }
}
```