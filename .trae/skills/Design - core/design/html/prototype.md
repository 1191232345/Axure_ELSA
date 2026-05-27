# 原型页面HTML

搜索卡片 + 操作卡片 + 数据表格 + 分页 + 逻辑说明。

```html
<main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
<div class="container mx-auto px-2 py-6">

    <!-- 搜索卡片 -->
    <div class="bg-white rounded shadow-card p-4 mb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div class="flex items-center w-full sm:w-auto">
                <label class="text-xs text-neutral-600 mr-2">状态</label>
                <select id="filterStatus" class="w-full sm:w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">全部</option>
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
                </select>
            </div>
            <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <button class="erp-btn erp-btn-secondary" onclick="handleReset()"><i class="fas fa-rotate-right mr-1.5"></i> 重置</button>
                <button class="erp-btn erp-btn-primary" onclick="handleSearch()"><i class="fas fa-search mr-1.5"></i> 搜索</button>
            </div>
        </div>
    </div>

    <!-- 操作卡片 -->
    <div class="bg-white rounded shadow-card p-4 mb-4">
        <div class="flex justify-start gap-3 flex-wrap">
            <button class="erp-btn erp-btn-primary" onclick="openAddModal()"><i class="fas fa-plus mr-1.5"></i> 新增</button>
            <button class="erp-btn erp-btn-secondary" onclick="handleExport()"><i class="fas fa-upload mr-1.5"></i> 导出</button>
            <button class="erp-btn erp-btn-danger batch-btn" disabled onclick="handleBatchDelete()"><i class="fas fa-trash-can mr-1.5"></i> 批量删除</button>
        </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded shadow-card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left"><input type="checkbox" id="selectAll" onchange="handleSelectAll()" class="w-4 h-4 text-primary border-gray-300 rounded"></th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">序号</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">名称</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">状态</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">操作</th>
                    </tr>
                </thead>
                <tbody id="tableBody" class="divide-y divide-neutral-100"></tbody>
            </table>
        </div>
        <div id="emptyState" class="hidden text-center py-12">
            <i class="fas fa-inbox text-6xl text-neutral-300 mb-4"></i>
            <h3 class="text-lg font-medium text-neutral-500 mb-2">暂无数据</h3>
            <button class="erp-btn erp-btn-primary" onclick="openAddModal()"><i class="fas fa-plus mr-1.5"></i> 立即添加</button>
        </div>
    </div>

    <!-- 分页 -->
    <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">共 <span id="totalCount" class="font-medium text-gray-700">0</span> 条</div>
        <div id="pagination" class="flex gap-1"></div>
    </div>

    <!-- 逻辑说明（见 logic-section.md） -->

</div>
</main>
```
