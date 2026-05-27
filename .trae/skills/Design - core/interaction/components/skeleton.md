# 骨架屏组件

数据加载时的占位骨架屏模板。

## 表格骨架屏

```html
<div id="tableSkeleton" class="bg-white rounded shadow-card overflow-hidden animate-pulse">
    <!-- 表头骨架 -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div class="w-5 h-5 bg-gray-200 rounded"></div>
        <div class="w-20 h-4 bg-gray-200 rounded"></div>
        <div class="flex-1 h-4 bg-gray-200 rounded"></div>
        <div class="w-24 h-4 bg-gray-200 rounded"></div>
        <div class="w-24 h-4 bg-gray-200 rounded"></div>
    </div>

    <!-- 数据行骨架 -->
    <div class="divide-y divide-gray-100">
        <div class="px-4 py-4 flex items-center gap-4">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex-1 h-4 bg-gray-200 rounded" style="width: 65%"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div class="flex gap-2">
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
                <div class="w-14 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>
        <!-- 更多行... -->
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

## 卡片骨架屏

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    <div class="bg-white rounded-lg shadow-card p-5">
        <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div class="space-y-3">
            <div class="h-5 bg-gray-200 rounded" style="width: 80%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 100%"></div>
            <div class="h-4 bg-gray-200 rounded" style="width: 60%"></div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div class="w-20 h-4 bg-gray-200 rounded"></div>
            <div class="w-16 h-7 bg-gray-200 rounded"></div>
        </div>
    </div>
    <!-- 更多卡片... -->
</div>
```

## JavaScript控制

```javascript
function showSkeleton() {
    document.getElementById('tableSkeleton').classList.remove('hidden');
    document.getElementById('dataTable').classList.add('hidden');
}

function hideSkeleton() {
    document.getElementById('tableSkeleton').classList.add('hidden');
    document.getElementById('dataTable').classList.remove('hidden');
}

async function loadDataWithSkeleton() {
    showSkeleton();
    try {
        const data = await APIDataManager.loadData();
        renderTable(data);
        hideSkeleton();
    } catch (error) {
        hideSkeleton();
        showErrorState(error);
    }
}
```