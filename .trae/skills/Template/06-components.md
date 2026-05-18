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

## 11. 配置按钮组件

**配置按钮组件已移至 [14-config-panel.md](14-config-panel.md)**，包含完整的可视化配置面板模板：
- 页面配置（标题、模块名称）
- 筛选条件配置
- 表格列配置
- 操作按钮配置
- 状态徽章配置
- 数据管理
- 导入导出功能

---

# 🆕 新增组件库 (v2.0)

> **新增于 2026-01-15** - 补充TOB产品常用但缺失的基础组件
>
> **重要**：以下组件统一使用 **Font Awesome 6** 图标（`fas`/`far`/`fab`前缀）

## 12. 空状态组件（Empty State）- 增强版

### 12.1 无数据空状态（带操作引导）

```html
<!-- 无数据 - 标准版 -->
<div class="empty-state text-center py-16 px-4">
    <!-- 图标区域 -->
    <div class="empty-state-icon mb-6">
        <i class="fas fa-inbox text-7xl text-neutral-300"></i>
    </div>

    <!-- 文字说明 -->
    <h3 class="text-xl font-semibold text-neutral-600 mb-2">暂无数据</h3>
    <p class="text-sm text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
        当前列表为空，您可以点击下方按钮添加新数据开始使用
    </p>

    <!-- 操作按钮 -->
    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
            <i class="fas fa-plus mr-2"></i>立即添加
        </button>
        <button class="erp-btn erp-btn-secondary" onclick="handleRefresh()">
            <i class="fas fa-refresh mr-2"></i>刷新数据
        </button>
    </div>
</div>

<!-- 使用场景：表格、列表无数据时 -->
```

### 12.2 搜索无结果

```html
<!-- 搜索无结果 -->
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-magnifying-glass text-7xl text-neutral-300"></i>
    </div>

    <h3 class="text-xl font-semibold text-neutral-600 mb-2">未找到匹配结果</h3>
    <p class="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
        没有找到符合"<span class="font-medium text-primary" id="searchKeywordDisplay">关键词</span>"的数据<br>
        请尝试调整搜索条件或重置筛选器
    </p>

    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-secondary" onclick="handleResetFilters()">
            <i class="fas fa-filter-circle-xmark mr-2"></i>重置筛选
        </button>
        <button class="erp-btn erp-btn-outline" onclick="clearSearchInput()">
            <i class="fas fa-xmark mr-2"></i>清除搜索词
        </button>
    </div>
</div>
```

### 12.3 错误/异常状态

```html
<!-- 加载失败 -->
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-triangle-exclamation text-7xl text-danger/30"></i>
    </div>

    <h3 class="text-xl font-semibold text-neutral-700 mb-2">加载失败</h3>
    <p class="text-sm text-neutral-500 mb-2 max-w-md mx-auto">
        数据加载遇到问题，可能是网络连接中断或服务器暂时不可用
    </p>
    <p class="text-xs text-neutral-400 mb-6">
        错误代码：<span class="font-mono bg-red-50 text-danger px-2 py-0.5 rounded">ERR_NETWORK</span>
    </p>

    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-primary" onclick="retryLoadData()">
            <i class="fas fa-rotate-right mr-2"></i>重新加载
        </button>
        <button class="erp-btn erp-btn-secondary" onclick="showErrorDetails()">
            <i class="fas fa-code mr-2"></i>查看详情
        </button>
    </div>
</div>

<!-- 权限不足 -->
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-lock text-7xl text-warning/30"></i>
    </div>

    <h3 class="text-xl font-semibold text-neutral-700 mb-2">权限不足</h3>
    <p class="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
        您没有访问此数据的权限，如需帮助请联系管理员
    </p>

    <button class="erp-btn erp-btn-secondary" onclick="contactAdmin()">
        <i class="fas fa-envelope mr-2"></i>联系管理员
    </button>
</div>
```

### 12.4 空状态CSS样式

```css
/* 空状态基础样式 */
.empty-state {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.empty-state-icon i {
    transition: transform 0.3s ease, color 0.3s ease;
}

.empty-state:hover .empty-state-icon i {
    transform: scale(1.05);
    color: var(--color-neutral-400, #9CA3AF);
}
```

---

## 13. 骨架屏组件（Skeleton Loading）

### 13.1 表格骨架屏

```html
<!-- 数据表格骨架屏 -->
<div id="tableSkeleton" class="bg-white rounded shadow-card overflow-hidden animate-pulse">
    <!-- 表头骨架 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div class="w-5 h-5 bg-gray-200 rounded"></div>  <!-- 复选框 -->
        <div class="w-20 h-4 bg-gray-200 rounded"></div>  <!-- 序号列头 -->
        <div class="flex-1 h-4 bg-gray-200 rounded"></div> <!-- 名称列头 -->
        <div class="w-24 h-4 bg-gray-200 rounded"></div>  <!-- 状态列头 -->
        <div class="w-24 h-4 bg-gray-200 rounded"></div>  <!-- 操作列头 -->
    </div>

    <!-- 数据行骨架（重复5行模拟加载中） -->
    <div class="divide-y divide-gray-100">
        <!-- 第1行 -->
        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 65%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div> <!-- 状态徽章 -->
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>  <!-- 编辑按钮 -->
                <div class="w-14 h-7 bg-gray-200 rounded"></div>  <!-- 删除按钮 -->
            </div>
        </div>

        <!-- 第2行 -->
        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 75%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>

        <!-- 第3-5行类似... -->
        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 55%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>

        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 80%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>

        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 60%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>

    <!-- 分页骨架 -->
    <div class="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        <div class="w-32 h-4 bg-gray-200 rounded"></div>
        <div class="flex gap-1">
            <div class="w-9 h-8 bg-gray-200 rounded"></div>
            <div class="w-9 h-8 bg-gray-200 rounded"></div>
            <div class="w-9 h-8 bg-gray-200 rounded"></div>
        </div>
    </div>
</div>
```

### 13.2 卡片列表骨架屏

```html
<!-- 卡片网格骨架屏（3列布局）-->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    <!-- 卡片1 -->
    <div class="bg-white rounded-lg shadow-card p-5">
        <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>  <!-- 图标占位 -->
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div> <!-- 状态徽章 -->
        </div>
        <div class="space-y-3">
            <div class="h-5 bg-gray-200 rounded" style="width: 80%"></div>  <!-- 标题 -->
            <div class="h-4 bg-gray-200 rounded" style="width: 100%"></div> <!-- 描述行1 -->
            <div class="h-4 bg-gray-200 rounded" style="width: 60%"></div> <!-- 描述行2 -->
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div class="w-20 h-4 bg-gray-200 rounded"></div>  <!-- 数值 -->
            <div class="w-16 h-7 bg-gray-200 rounded"></div>   <!-- 按钮 -->
        </div>
    </div>

    <!-- 卡片2、3... 类似结构 -->
    <div class="bg-white rounded-lg shadow-card p-5">
        <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div class="space-y-3">
            <div class="h-5 bg-gray-200 rounded" style="width: 70%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 90%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 50%"></div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div class="w-20 h-4 bg-gray-200 rounded"></div>
            <div class="w-16 h-7 bg-gray-200 rounded"></div>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow-card p-5">
        <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div class="space-y-3">
            <div class="h-5 bg-gray-200 rounded" style="width: 85%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 95%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 70%"></div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div class="w-20 h-4 bg-gray-200 rounded"></div>
            <div class="w-16 h-7 bg-gray-200 rounded"></div>
        </div>
    </div>
</div>
```

### 13.3 详情页骨架屏

```html
<!-- 详情页骨架屏 -->
<div class="animate-pulse space-y-4">
    <!-- 头部信息区 -->
    <div class="bg-white rounded-lg shadow-card p-6">
        <div class="flex items-start gap-6">
            <!-- 左侧图标/图片占位 -->
            <div class="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"></div>

            <!-- 右侧信息占位 -->
            <div class="flex-1 space-y-3">
                <div class="h-7 bg-gray-200 rounded" style="width: 40%"></div>  <!-- 标题 -->
                <div class="h-4 bg-gray-200 rounded" style="width: 25%"></div>  <!-- 副标题 -->
                <div class="flex gap-4 mt-4">
                    <div class="h-6 bg-gray-200 rounded-full w-20"></div>     <!-- 标签1 -->
                    <div class="h-6 bg-gray-200 rounded-full w-24"></div>     <!-- 标签2 -->
                    <div class="h-6 bg-gray-200 rounded-full w-16"></div>     <!-- 标签3 -->
                </div>
            </div>
        </div>
    </div>

    <!-- 内容区块 -->
    <div class="bg-white rounded-lg shadow-card p-6">
        <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>  <!-- 区块标题 -->
        <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 90%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 75%"></div>
        </div>
    </div>

    <!-- 表格式信息 -->
    <div class="bg-white rounded-lg shadow-card p-6">
        <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div class="space-y-4">
            <div class="flex items-center gap-4">
                <div class="w-24 h-4 bg-gray-200 rounded"></div>  <!-- 字段标签 -->
                <div class="flex-1 h-4 bg-gray-200 rounded"></div>  <!-- 字段值 -->
            </div>
            <div class="flex items-center gap-4">
                <div class="w-24 h-4 bg-gray-200 rounded"></div>
                <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 60%"></div>
            </div>
            <div class="flex items-center gap-4">
                <div class="w-24 h-4 bg-gray-200 rounded"></div>
                <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 80%"></div>
            </div>
        </div>
    </div>
</div>
```

### 13.4 骨架屏CSS动画优化

```css
/* 骨架屏闪烁动画 */
@keyframes skeleton-shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.skeleton-shimmer {
    background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* 使用方式：将 animate-pulse 替换为 skeleton-shimmer */
.skeleton-box {
    @apply skeleton-shimmer rounded;
}
```

**JavaScript 控制显示/隐藏**：
```javascript
// 显示骨架屏
function showSkeleton() {
    document.getElementById('tableSkeleton').classList.remove('hidden');
    document.getElementById('dataTable').classList.add('hidden');
}

// 隐藏骨架屏，显示真实数据
function hideSkeleton() {
    document.getElementById('tableSkeleton').classList.add('hidden');
    document.getElementById('dataTable').classList.remove('hidden');
}

// 数据加载流程示例
async function loadDataWithSkeleton() {
    showSkeleton(); // 1. 显示骨架屏

    try {
        const data = await APIDataManager.loadData(); // 2. 加载数据
        renderTable(data); // 3. 渲染数据
        hideSkeleton(); // 4. 隐藏骨架屏
    } catch (error) {
        hideSkeleton();
        showErrorState(error); // 显示错误状态
    }
}
```

---

## 14. 通知提醒组件（Notification / Alert）

### 14.1 内联提示框（Alert）

#### 成功提示

```html
<div class="alert alert-success mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-circle-check text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">操作成功</h4>
            <p class="text-sm opacity-90">数据已成功保存到系统，您可以在列表中查看最新信息。</p>
        </div>
        <button class="alert-close flex-shrink-0 hover:opacity-70 transition-opacity"
                onclick="this.closest('.alert').remove()"
                aria-label="关闭">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

#### 警告提示

```html
<div class="alert alert-warning mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-triangle-exclamation text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">请注意</h4>
            <p class="text-sm opacity-90">该操作将影响已关联的数据，请确认是否继续执行。</p>
        </div>
        <div class="alert-actions flex-shrink-0 flex gap-2 ml-4">
            <button class="text-xs font-medium underline hover:no-underline">查看详情</button>
            <button class="alert-close hover:opacity-70 transition-opacity"
                    onclick="this.closest('.alert').remove()"
                    aria-label="关闭">
                <i class="fas fa-xmark"></i>
            </button>
        </div>
    </div>
</div>
```

#### 危险/错误提示

```html
<div class="alert alert-danger mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-circle-exclamation text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">操作失败</h4>
            <p class="text-sm opacity-90 mb-2">保存时发生错误：网络连接超时。</p>
            <a href="#" class="text-sm font-medium underline hover:no-underline">查看错误详情 →</a>
        </div>
        <button class="alert-close flex-shrink-0 hover:opacity-70 transition-opacity"
                onclick="this.closest('.alert').remove()"
                aria-label="关闭">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

#### 信息提示

```html
<div class="alert alert-info mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-circle-info text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">提示信息</h4>
            <p class="text-sm opacity-90">系统将于今晚22:00-23:00进行例行维护，届时部分功能可能暂时不可用。</p>
        </div>
        <button class="alert-close flex-shrink-0 hover:opacity-70 transition-opacity"
                onclick="this.closest('.alert').remove()"
                aria-label="关闭">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

### 14.2 Alert CSS样式

```css
/* 提示框基础样式 */
.alert {
    display: flex;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border-left-width: 4px;
    border-left-style: solid;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 成功提示 */
.alert-success {
    background-color: #E8FFEC;
    border-left-color: #00B42A;
    color: #006B19;
}

.alert-success .alert-icon {
    color: #00B42A;
}

/* 警告提示 */
.alert-warning {
    background-color: #FFF7E8;
    border-left-color: #FF7D00;
    color: #994D00;
}

.alert-warning .alert-icon {
    color: #FF7D00;
}

/* 危险/错误提示 */
.alert-danger {
    background-color: #FFECE8;
    border-left-color: #F53F3F;
    color: #B3261E;
}

.alert-danger .alert-icon {
    color: #F53F3F;
}

/* 信息提示 */
.alert-info {
    background-color: #E8F3FF;
    border-left-color: #1677FF;
    color: #094D8C;
}

.alert-info .alert-icon {
    color: #1677FF;
}

/* 关闭按钮 */
.alert-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
}
```

### 14.3 Toast 通知（全局浮动提示）

```html
<!-- Toast 容器（固定在页面右上角）-->
<div id="toastContainer" class="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">

    <!-- 成功Toast示例 -->
    <div class="toast toast-success pointer-events-auto" role="status">
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border-l-4 border-success min-w-[320px]">
            <i class="fas fa-check-circle text-success text-lg flex-shrink-0"></i>
            <span class="flex-1 text-sm font-medium text-gray-800">操作成功完成</span>
            <button class="text-gray-400 hover:text-gray-600 transition-colors"
                    onclick="this.closest('.toast').remove()">
                <i class="fas fa-xmark"></i>
            </button>
        </div>
    </div>

    <!-- 错误Toast示例 -->
    <div class="toast toast-error pointer-events-auto" role="alert">
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border-l-4 border-danger min-w-[320px]">
            <i class="fas fa-times-circle text-danger text-lg flex-shrink-0"></i>
            <span class="flex-1 text-sm font-medium text-gray-800">网络请求失败</span>
            <button class="text-gray-400 hover:text-gray-600 transition-colors"
                    onclick="this.closest('.toast').remove()">
                <i class="fas fa-xmark"></i>
            </button>
        </div>
    </div>

</div>
```

**Toast JavaScript 工具函数**：
```javascript
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer') || createToastContainer();

    const icons = {
        success: 'fa-check-circle text-success',
        error: 'fa-times-circle text-danger',
        warning: 'fa-exclamation-circle text-warning',
        info: 'fa-circle-info text-info'
    };

    const colors = {
        success: 'border-success',
        error: 'border-danger',
        warning: 'border-warning',
        info: 'border-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast pointer-events-auto`;
    toast.innerHTML = `
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border-l-4 ${colors[type]} min-w-[320px]"
             style="animation: slideInRight 0.3s ease-out">
            <i class="fas ${icons[type]} text-lg flex-shrink-0"></i>
            <span class="flex-1 text-sm font-medium text-gray-800">${message}</span>
            <button class="text-gray-400 hover:text-gray-600 transition-colors"
                    onclick="this.closest('.toast').remove()">
                <i class="fas fa-xmark"></i>
            </button>
        </div>
    `;

    container.appendChild(toast);

    // 自动消失
    if (duration > 0) {
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return toast;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-4 right-4 z-[60] space-y-3 pointer-events-none';
    document.body.appendChild(container);
    return container;
}
```

---

## 15. 面包屑导航组件（Breadcrumb）

### 15.1 基础面包屑

```html
<nav aria-label="面包屑导航" class="mb-4">
    <ol class="breadcrumb flex items-center flex-wrap gap-2 text-sm">
        <li class="breadcrumb-item">
            <a href="/" class="text-neutral-500 hover:text-primary transition-colors">
                <i class="fas fa-house-chimney mr-1"></i>首页
            </a>
        </li>

        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>

        <li class="breadcrumb-item">
            <a href="/modules" class="text-neutral-500 hover:text-primary transition-colors">
                模块管理
            </a>
        </li>

        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>

        <li class="breadcrumb-item">
            <a href="/modules/inventory" class="text-neutral-500 hover:text-primary transition-colors">
                库存管理
            </a>
        </li>

        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>

        <li class="breadcrumb-item active text-primary font-medium" aria-current="page">
            库存详情
        </li>
    </ol>
</nav>
```

### 15.2 带图标的面包屑（适用于功能模块）

```html
<nav aria-label="面包屑导航" class="mb-4">
    <ol class="breadcrumb flex items-center flex-wrap gap-2 text-sm bg-white px-4 py-2.5 rounded-lg shadow-sm border border-neutral-200">
        <li class="breadcrumb-item">
            <a href="/" class="inline-flex items-center gap-1.5 text-neutral-600 hover:text-primary transition-colors">
                <i class="fas fa-grid-2 text-base"></i>
                <span>工作台</span>
            </a>
        </li>

        <li class="breadcrumb-separator text-neutral-300">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>

        <li class="breadcrumb-item">
            <a href="/warehouse" class="inline-flex items-center gap-1.5 text-neutral-600 hover:text-primary transition-colors">
                <i class="fas fa-warehouse text-base"></i>
                <span>仓库管理</span>
            </a>
        </li>

        <li class="breadcrumb-separator text-neutral-300">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>

        <li class="breadcrumb-item active text-primary font-medium flex items-center gap-1.5" aria-current="page">
            <i class="fas fa-boxes-stacked text-base"></i>
            <span>库存列表</span>
        </li>
    </ol>
</nav>
```

### 15.3 可编辑路径的面包屑（高级）

```html
<nav aria-label="面包屑导航" class="mb-4">
    <div class="flex items-center gap-2 text-sm">
        <!-- 路径选择下拉 -->
        <select id="breadcrumbPath" onchange="navigateToPath(this.value)"
                class="px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none bg-white">
            <option value="/">根目录</option>
            <option value="/warehouse/de001" selected>DE001仓库</option>
            <option value="/warehouse/de001/zone-a">A区</option>
            <option value="/warehouse/de001/zone-a/rack-01">货架01</option>
        </select>

        <!-- 当前位置指示 -->
        <div class="flex items-center gap-1.5 text-neutral-600">
            <i class="fas fa-location-dot text-primary"></i>
            <span class="font-medium">货架01</span>
            <span class="text-neutral-400">(共128个SKU)</span>
        </div>
    </div>
</nav>
```

### 15.4 面包屑CSS样式

```css
.breadcrumb {
    list-style: none;
    margin: 0;
    padding: 0;
}

.breadcrumb-item + .breadcrumb-separator::before {
    content: '';
}

.breadcrumb-item a {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
}

.breadcrumb-item.active {
    color: var(--color-primary, #2a3b7d);
    pointer-events: none;
}

.breadcrumb-item a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}
```

---

## 16. 标签页组件（Tabs）

### 16.1 基础标签页（线型）

```html
<div class="tabs-container">
    <!-- 标签头部 -->
    <div class="tabs-header flex border-b border-neutral-200" role="tablist">
        <button class="tab-item active px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary transition-all"
                role="tab"
                aria-selected="true"
                onclick="switchTab(this, 'tab-content-1')">
            <i class="fas fa-table-list mr-2"></i>基本信息
        </button>

        <button class="tab-item px-4 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-primary hover:border-neutral-300 transition-all"
                role="tab"
                aria-selected="false"
                onclick="switchTab(this, 'tab-content-2')">
            <i class="fas fa-paperclip mr-2"></i>附件管理
            <span class="ml-2 px-1.5 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full">3</span>
        </button>

        <button class="tab-item px-4 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-primary hover:border-neutral-300 transition-all"
                role="tab"
                aria-selected="false"
                onclick="switchTab(this, 'tab-content-3')">
            <i class="fas fa-clock-rotate-left mr-2"></i>操作日志
        </button>
    </div>

    <!-- 标签内容区 -->
    <div class="tabs-content pt-4">
        <div id="tab-content-1" class="tab-pane active" role="tabpanel">
            <p class="text-sm text-neutral-600">基本信息内容区域...</p>
        </div>

        <div id="tab-content-2" class="tab-pane hidden" role="tabpanel">
            <p class="text-sm text-neutral-600">附件管理内容区域...</p>
        </div>

        <div id="tab-content-3" class="tab-pane hidden" role="tabpanel">
            <p class="text-sm text-neutral-600">操作日志内容区域...</p>
        </div>
    </div>
</div>
```

### 16.2 卡片型标签页（Pills）

```html
<div class="tabs-container">
    <div class="tabs-header flex gap-2 p-1 bg-neutral-100 rounded-lg" role="tablist">
        <button class="tab-pill active flex-1 px-4 py-2 text-sm font-medium bg-white rounded-md shadow-sm text-primary transition-all"
                role="tab"
                onclick="switchTabPill(this, 'pill-content-1')">
            <i class="fas fa-chart-simple mr-2"></i>数据统计
        </button>

        <button class="tab-pill flex-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-md transition-all"
                role="tab"
                onclick="switchTabPill(this, 'pill-content-2')">
            <i class="fas fa-chart-line mr-2"></i>趋势分析
        </button>

        <button class="tab-pill flex-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-md transition-all"
                role="tab"
                onclick="switchTabPill(this, 'pill-content-3')">
            <i class="fas fa-gear mr-2"></i>设置选项
        </button>
    </div>

    <div class="tabs-content mt-4">
        <div id="pill-content-1" class="tab-pane active" role="tabpanel">
            <!-- 统计图表内容 -->
        </div>

        <div id="pill-content-2" class="tab-pane hidden" role="tabpanel">
            <!-- 趋势分析内容 -->
        </div>

        <div id="pill-content-3" class="tab-pane hidden" role="tabpanel">
            <!-- 设置选项内容 -->
        </div>
    </div>
</div>
```

### 16.3 标签页 JavaScript 控制函数

```javascript
/**
 * 切换线型标签页
 * @param {HTMLElement} tabButton - 点击的标签按钮元素
 * @param {string} targetContentId - 目标内容区域的ID
 */
function switchTab(tabButton, targetContentId) {
    const tabsContainer = tabButton.closest('.tabs-container');

    // 移除所有标签的激活状态
    tabsContainer.querySelectorAll('.tab-item').forEach(function(tab) {
        tab.classList.remove('active', 'border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-neutral-600');
        tab.setAttribute('aria-selected', 'false');
    });

    // 激活当前点击的标签
    tabButton.classList.add('active', 'border-primary', 'text-primary');
    tabButton.classList.remove('border-transparent', 'text-neutral-600');
    tabButton.setAttribute('aria-selected', 'true');

    // 隐藏所有内容面板
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
        pane.classList.remove('active');
    });

    // 显示目标内容面板
    const targetPane = document.getElementById(targetContentId);
    if (targetPane) {
        targetPane.classList.remove('hidden');
        targetPane.classList.add('active');
    }
}

/**
 * 切换卡片型标签页（Pills）
 * @param {HTMLElement} pillButton - 点击的标签按钮元素
 * @param {string} targetContentId - 目标内容区域的ID
 */
function switchTabPill(pillButton, targetContentId) {
    const tabsContainer = pillButton.closest('.tabs-container');

    // 移除所有pill的激活状态
    tabsContainer.querySelectorAll('.tab-pill').forEach(function(pill) {
        pill.classList.remove('active', 'bg-white', 'shadow-sm', 'text-primary');
        pill.classList.add('text-neutral-600');
    });

    // 激活当前点击的pill
    pillButton.classList.add('active', 'bg-white', 'shadow-sm', 'text-primary');
    pillButton.classList.remove('text-neutral-600');

    // 切换内容面板（同上逻辑）
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
    });

    const targetPane = document.getElementById(targetContentId);
    if (targetPane) {
        targetPane.classList.remove('hidden');
    }
}
```

### 16.4 标签页完整CSS

```css
/* 线型标签页 */
.tabs-header {
    overflow-x: auto;
    scrollbar-width: thin;
}

.tab-item {
    position: relative;
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
}

.tab-item:hover:not(.active) {
    background-color: rgba(42, 59, 125, 0.04);
}

.tab-item:focus-visible {
    outline: 2px solid var(--color-primary, #2a3b7d);
    outline-offset: -2px;
    border-radius: 4px 4px 0 0;
}

/* 卡片型标签页 */
.tab-pill {
    position: relative;
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
}

.tab-pill:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.6);
}

.tab-pill:focus-visible {
    outline: 2px solid var(--color-primary, #2a3b7d);
    outline-offset: 2px;
}

/* 内容面板切换动画 */
.tab-pane {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## ✅ 新增组件使用建议

| 组件 | 适用场景 | 优先级 |
|------|----------|:------:|
| **空状态 (12)** | 表格/列表无数据、搜索无结果、错误状态 | ⭐⭐⭐ 必须使用 |
| **骨架屏 (13)** | 数据加载中、首屏优化 | ⭐⭐⭐ 强烈推荐 |
| **通知提醒 (14)** | 表单验证反馈、系统通知、操作结果 | ⭐⭐⭐ 必须使用 |
| **面包屑 (15)** | 多层级页面导航、当前位置指示 | ⭐⭐ 推荐 |
| **标签页 (16)** | 详情页多视图切换、设置分类 | ⭐⭐ 推荐 |

---

**🎉 v2.0 更新完成！**

本次更新共新增 **5个核心组件** 和 **30+ 个变体**，全部采用 Font Awesome 6 图标规范，确保与升级后的模板体系完全兼容。
