# 检索条件逻辑

搜索/筛选条件的逻辑模板。

```html
<div class="p-4 border-b border-gray-100">
    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-search text-primary mr-2"></i>检索条件
    </h4>
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">检索项</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">输入方式</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">逻辑说明</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[检索项名称]</td>
                    <td class="px-3 py-2 text-gray-600">文本输入框/下拉选择框/日期选择器</td>
                    <td class="px-3 py-2 text-gray-600">[查询逻辑说明]</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```
