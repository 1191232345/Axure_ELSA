# 业务组件库

本文件包含TOB产品的业务组件库，提取自企业级项目的可复用组件。

## 1. 筛选器组件

### 1.1 基础筛选器

```html
<!-- 筛选区域 -->
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <!-- 文本输入筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">[字段名称]</label>
            <div class="relative flex-1 sm:w-64">
                <input type="text" placeholder="请输入..." class="w-full pl-7 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
            </div>
        </div>
        
        <!-- 下拉选择筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">[字段名称]</label>
            <select class="flex-1 sm:w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                <option value="">全部</option>
                <option value="1">选项1</option>
                <option value="2">选项2</option>
            </select>
        </div>
        
        <!-- 日期范围筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">日期范围</label>
            <div class="flex items-center gap-2">
                <input type="date" class="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <span class="text-neutral-400">至</span>
                <input type="date" class="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button class="erp-btn erp-btn-secondary flex items-center justify-center flex-1 sm:flex-none">
                <i class="fa fa-refresh mr-1.5"></i> 重置
            </button>
            <button class="erp-btn erp-btn-primary flex items-center justify-center flex-1 sm:flex-none">
                <i class="fa fa-search mr-1.5"></i> 搜索
            </button>
        </div>
    </div>
</div>
```

### 1.2 高级筛选器（可折叠）

```html
<!-- 高级筛选区域 -->
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">筛选条件</span>
        <button class="text-xs text-primary hover:text-primary-light" onclick="toggleAdvancedFilter()">
            <i class="fa fa-chevron-down mr-1" id="filter-toggle-icon"></i>
            展开/收起
        </button>
    </div>
    
    <!-- 基础筛选 -->
    <div class="flex flex-wrap gap-3">
        <!-- 筛选项 -->
    </div>
    
    <!-- 高级筛选（默认隐藏） -->
    <div id="advanced-filter" class="hidden mt-4 pt-4 border-t border-gray-100">
        <div class="flex flex-wrap gap-3">
            <!-- 更多筛选项 -->
        </div>
    </div>
</div>
```

## 2. 按钮组件

### 2.1 主按钮

```html
<button class="erp-btn erp-btn-primary">
    <i class="fa fa-plus mr-1.5"></i> 新增
</button>
```

### 2.2 次要按钮

```html
<button class="erp-btn erp-btn-secondary">
    <i class="fa fa-download mr-1.5"></i> 导出
</button>
```

### 2.3 警告按钮

```html
<button class="erp-btn erp-btn-warning">
    <i class="fa fa-edit mr-1.5"></i> 编辑
</button>
```

### 2.4 危险按钮

```html
<button class="erp-btn erp-btn-danger">
    <i class="fa fa-trash mr-1.5"></i> 删除
</button>
```

### 2.5 成功按钮

```html
<button class="erp-btn erp-btn-success">
    <i class="fa fa-check mr-1.5"></i> 确认
</button>
```

### 2.6 按钮组

```html
<div class="flex gap-2">
    <button class="erp-btn erp-btn-primary">
        <i class="fa fa-plus mr-1.5"></i> 新增
    </button>
    <button class="erp-btn erp-btn-secondary">
        <i class="fa fa-download mr-1.5"></i> 导出
    </button>
</div>
```

## 3. 状态徽章组件

### 3.1 基础状态徽章

```html
<!-- 启用状态 -->
<span class="status-badge bg-green-100 text-green-700">启用</span>

<!-- 禁用状态 -->
<span class="status-badge bg-red-100 text-red-700">禁用</span>

<!-- 待审核状态 -->
<span class="status-badge bg-yellow-100 text-yellow-700">待审核</span>

<!-- 已完成状态 -->
<span class="status-badge bg-blue-100 text-blue-700">已完成</span>
```

### 3.2 带图标的状态徽章

```html
<span class="status-badge bg-green-100 text-green-700">
    <i class="fa fa-check-circle mr-1"></i> 启用
</span>

<span class="status-badge bg-red-100 text-red-700">
    <i class="fa fa-times-circle mr-1"></i> 禁用
</span>
```

## 4. 模态框组件

### 4.1 基础模态框

```html
<!-- 模态框 -->
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

### 4.2 确认对话框

```html
<!-- 确认对话框 -->
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

### 4.3 表单模态框

```html
<!-- 表单模态框 -->
<div id="form-modal" class="modal-overlay">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h3 class="modal-title">新增/编辑</h3>
            <button class="close-btn" onclick="closeModal('form-modal')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>字段名称 <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="请输入...">
            </div>
            <div class="form-group">
                <label>选择项 <span class="required">*</span></label>
                <select class="form-select">
                    <option value="">请选择</option>
                    <option value="1">选项1</option>
                    <option value="2">选项2</option>
                </select>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea class="form-textarea" rows="3" placeholder="请输入备注..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('form-modal')">取消</button>
            <button class="erp-btn erp-btn-primary">保存</button>
        </div>
    </div>
</div>
```

## 5. 表单组件

### 5.1 文本输入框

```html
<div class="form-group">
    <label>字段名称 <span class="required">*</span></label>
    <input type="text" class="form-input" placeholder="请输入...">
</div>
```

### 5.2 下拉选择框

```html
<div class="form-group">
    <label>选择项 <span class="required">*</span></label>
    <select class="form-select">
        <option value="">请选择</option>
        <option value="1">选项1</option>
        <option value="2">选项2</option>
    </select>
</div>
```

### 5.3 多行文本框

```html
<div class="form-group">
    <label>备注</label>
    <textarea class="form-textarea" rows="3" placeholder="请输入备注..."></textarea>
</div>
```

### 5.4 日期选择器

```html
<div class="form-group">
    <label>日期</label>
    <input type="date" class="form-input">
</div>
```

### 5.5 复选框

```html
<div class="form-group">
    <label class="flex items-center">
        <input type="checkbox" class="checkbox-primary mr-2">
        <span class="text-sm text-gray-700">选项说明</span>
    </label>
</div>
```

### 5.6 单选按钮组

```html
<div class="form-group">
    <label>选项</label>
    <div class="flex gap-4 mt-2">
        <label class="flex items-center">
            <input type="radio" name="option" class="mr-2">
            <span class="text-sm text-gray-700">选项A</span>
        </label>
        <label class="flex items-center">
            <input type="radio" name="option" class="mr-2">
            <span class="text-sm text-gray-700">选项B</span>
        </label>
    </div>
</div>
```

## 6. 加载状态组件

### 6.1 页面加载中

```html
<div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span class="ml-3 text-gray-500">加载中...</span>
</div>
```

### 6.2 按钮加载状态

```html
<button class="erp-btn erp-btn-primary" disabled>
    <i class="fa fa-spinner fa-spin mr-1.5"></i> 处理中...
</button>
```

### 6.3 骨架屏

```html
<div class="animate-pulse space-y-4">
    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

## 7. 空状态组件

### 7.1 无数据

```html
<div class="text-center py-12">
    <i class="fa fa-inbox text-5xl text-gray-300 mb-4"></i>
    <p class="text-gray-500">暂无数据</p>
</div>
```

### 7.2 搜索无结果

```html
<div class="text-center py-12">
    <i class="fa fa-search text-5xl text-gray-300 mb-4"></i>
    <p class="text-gray-500">未找到匹配的结果</p>
    <button class="erp-btn erp-btn-secondary mt-4">重置筛选条件</button>
</div>
```

### 7.3 错误状态

```html
<div class="text-center py-12">
    <i class="fa fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
    <p class="text-gray-500">加载失败</p>
    <button class="erp-btn erp-btn-primary mt-4">重新加载</button>
</div>
```

## 8. 分页组件

### 8.1 基础分页

```html
<div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
    <div class="text-sm text-gray-500">
        显示第 1-10 条，共 100 条
    </div>
    <div class="flex items-center gap-1">
        <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            <i class="fa fa-angle-left"></i>
        </button>
        <button class="px-3 py-1 text-sm border border-primary bg-primary text-white rounded">1</button>
        <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
        <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">3</button>
        <span class="px-2">...</span>
        <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">10</button>
        <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            <i class="fa fa-angle-right"></i>
        </button>
    </div>
</div>
```

### 8.2 简洁分页

```html
<div class="flex items-center justify-center gap-2 py-4">
    <button class="erp-btn erp-btn-secondary text-sm">
        <i class="fa fa-angle-left"></i> 上一页
    </button>
    <span class="text-sm text-gray-500">第 1 页 / 共 10 页</span>
    <button class="erp-btn erp-btn-secondary text-sm">
        下一页 <i class="fa fa-angle-right"></i>
    </button>
</div>
```

## 9. 提示消息组件

### 9.1 成功提示

```html
<div class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
    <i class="fa fa-check-circle mr-2"></i>
    <span>操作成功</span>
</div>
```

### 9.2 错误提示

```html
<div class="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
    <i class="fa fa-times-circle mr-2"></i>
    <span>操作失败，请重试</span>
</div>
```

### 9.3 警告提示

```html
<div class="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
    <i class="fa fa-exclamation-triangle mr-2"></i>
    <span>请注意：数据可能不完整</span>
</div>
```

### 9.4 信息提示

```html
<div class="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
    <i class="fa fa-info-circle mr-2"></i>
    <span>提示信息</span>
</div>
```

## 10. 树形表格组件

### 10.1 基础树形表格

```html
<div class="bg-white rounded shadow-card overflow-hidden">
    <table class="min-w-full">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            <!-- 父级节点 -->
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <button class="mr-2 text-gray-400 hover:text-gray-600" onclick="toggleTreeNode(this)">
                            <i class="fa fa-caret-right"></i>
                        </button>
                        <i class="fa fa-folder text-yellow-500 mr-2"></i>
                        <span class="font-medium">父级节点</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">文件夹</td>
                <td class="px-4 py-3">
                    <span class="status-badge bg-green-100 text-green-700">启用</span>
                </td>
                <td class="px-4 py-3 text-sm">
                    <button class="table-btn text-primary hover:text-primary-light mr-2">编辑</button>
                    <button class="table-btn text-danger hover:text-red-600">删除</button>
                </td>
            </tr>
            <!-- 子级节点（默认隐藏） -->
            <tr class="hover:bg-gray-50 hidden tree-child">
                <td class="px-4 py-3">
                    <div class="flex items-center pl-8">
                        <i class="fa fa-file text-blue-500 mr-2"></i>
                        <span>子级节点</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">文件</td>
                <td class="px-4 py-3">
                    <span class="status-badge bg-green-100 text-green-700">启用</span>
                </td>
                <td class="px-4 py-3 text-sm">
                    <button class="table-btn text-primary hover:text-primary-light mr-2">编辑</button>
                    <button class="table-btn text-danger hover:text-red-600">删除</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

### 10.2 树形表格展开/收起脚本

```javascript
function toggleTreeNode(btn) {
    const icon = btn.querySelector('i');
    const row = btn.closest('tr');
    const nextRows = row.nextElementSibling;
    
    if (icon.classList.contains('fa-caret-right')) {
        icon.classList.remove('fa-caret-right');
        icon.classList.add('fa-caret-down');
        if (nextRows && nextRows.classList.contains('tree-child')) {
            nextRows.classList.remove('hidden');
        }
    } else {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
        if (nextRows && nextRows.classList.contains('tree-child')) {
            nextRows.classList.add('hidden');
        }
    }
}
```
