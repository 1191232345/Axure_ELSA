# 模态框HTML

新增/编辑模态框 + 确认删除对话框。

## 表单模态框

```html
<div id="addModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">新增</h3>
            <button class="modal-close" onclick="closeModal('addModal')"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">名称 <span class="required">*</span></label>
                <input type="text" id="formName" class="form-input" placeholder="请输入名称">
            </div>
            <div class="form-group">
                <label class="form-label">状态</label>
                <select id="formStatus" class="form-select">
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('addModal')">取消</button>
            <button class="erp-btn erp-btn-primary" onclick="handleSave()">确定</button>
        </div>
    </div>
</div>
```

## 确认删除对话框

```html
<div id="deleteModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h3 class="modal-title">确认删除</h3>
            <button class="modal-close" onclick="closeModal('deleteModal')"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="flex items-start gap-3">
                <i class="fas fa-triangle-exclamation text-warning text-xl mt-0.5"></i>
                <p class="text-gray-600">确定要删除选中的数据吗？此操作不可恢复。</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('deleteModal')">取消</button>
            <button class="erp-btn erp-btn-danger" onclick="confirmDelete()">确认删除</button>
        </div>
    </div>
</div>
```
