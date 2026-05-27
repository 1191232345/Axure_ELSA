# 分页组件

分页导航模板，包含基础分页和简洁分页。

## 基础分页

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

## 简洁分页

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

## JavaScript

```javascript
function changePage(page) {
    currentPage = page;
    renderTable();
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(totalCount / pageSize);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = generatePaginationHTML(currentPage, totalPages);
}
```