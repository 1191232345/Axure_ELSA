# 树形表格组件

树形结构表格模板，支持展开/收起。

## 基础树形表格

```html
<div class="bg-white rounded shadow-card overflow-hidden">
    <table class="min-w-full">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
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
                    <button class="table-btn text-primary mr-2">编辑</button>
                    <button class="table-btn text-danger">删除</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

## JavaScript

```javascript
function toggleTreeNode(btn) {
    var icon = btn.querySelector('i');
    var row = btn.closest('tr');
    var nextRows = row.nextElementSibling;
    
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