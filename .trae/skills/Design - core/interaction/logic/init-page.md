# 初始化页面逻辑

页面加载时的数据展示逻辑模板。

```html
<div class="p-4 border-b border-gray-100">
    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-database text-primary mr-2"></i>初始化页面（数据展示逻辑）
    </h4>
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">逻辑项</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">展示规则</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">备注</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[逻辑项名称]</td>
                    <td class="px-3 py-2 text-gray-600">[功能说明]</td>
                    <td class="px-3 py-2 text-gray-600">[数据来源表/接口]</td>
                    <td class="px-3 py-2 text-gray-600">[展示规则描述]</td>
                    <td class="px-3 py-2 text-gray-600">[补充说明/注意事项]</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```
