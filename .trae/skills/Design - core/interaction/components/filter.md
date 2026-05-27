# 筛选器组件

筛选区域模板，包含基础筛选器和高级筛选器。

## 基础筛选器

```html
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

## 高级筛选器（可折叠）

```html
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

## JavaScript

```javascript
function toggleAdvancedFilter() {
    const filter = document.getElementById('advanced-filter');
    const icon = document.getElementById('filter-toggle-icon');
    filter.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}
```