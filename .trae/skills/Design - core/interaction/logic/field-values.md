# 属性取值逻辑

主表 + 弹窗/表单的属性取值逻辑模板。

## 主表属性取值

```html
<div class="p-4 border-b border-gray-100">
    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-list-alt text-primary mr-2"></i>属性取值逻辑（主表）
    </h4>
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">字段</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">取值规则</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">显示格式</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">存储长度</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">属性存储类型</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[字段名称]</td>
                    <td class="px-3 py-2 text-gray-600">[字段说明]</td>
                    <td class="px-3 py-2 text-gray-600">键盘输入/手工选择/系统生成</td>
                    <td class="px-3 py-2 text-gray-600">[取值规则说明]</td>
                    <td class="px-3 py-2 text-gray-600">文本显示/数字/日期格式</td>
                    <td class="px-3 py-2 text-gray-600">32/64/128/256/512</td>
                    <td class="px-3 py-2 text-gray-600">字符型/数值型/枚举型/DATE/DATETIME</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

## 弹窗/表单属性取值

```html
<div class="p-4">
    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-list-alt text-primary mr-2"></i>属性取值逻辑（[弹窗名称]）
    </h4>
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">字段</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">取值规则</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">显示格式</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">存储长度</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">属性存储类型</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[字段名称]</td>
                    <td class="px-3 py-2 text-gray-600">[字段说明]</td>
                    <td class="px-3 py-2 text-gray-600">键盘输入/手工选择/系统生成</td>
                    <td class="px-3 py-2 text-gray-600">[取值规则说明]</td>
                    <td class="px-3 py-2 text-gray-600">文本显示/数字/日期格式</td>
                    <td class="px-3 py-2 text-gray-600">32/64/128/256/512</td>
                    <td class="px-3 py-2 text-gray-600">字符型/数值型/枚举型/DATE/DATETIME</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

## 字段取值说明

| 存储长度 | 适用场景 |
|----------|----------|
| 32 | 短文本（编码、状态值） |
| 64 | 中短文本（名称、标题） |
| 128 | 中等文本（路径、详细名称） |
| 256 | 较长文本（描述、备注） |
| 512 | 长文本（详细说明、JSON片段） |

| 存储类型 | 说明 | 示例 |
|----------|------|------|
| 字符型 | 文本字符串 | 仓库名称、SKU编码 |
| 数值型 | 数字类型 | 库存数量、单价 |
| 枚举型 | 固定值集合 | 状态（启用/禁用） |
| DATE | 仅年月日 | 创建日期、生效日期 |
| DATETIME | 年月日时分秒 | 创建时间、更新时间 |
