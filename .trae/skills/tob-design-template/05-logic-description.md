# 逻辑说明区域模板

本文件包含TOB产品的逻辑说明区域模板，用于描述页面的业务逻辑。

## 0. 放置位置

**重要：逻辑说明应放置在原型tab页下，而不是PRD或测试用例tab页。**

每个页面包含三个tab页：
- **原型tab**：包含页面原型UI和逻辑说明
- **PRD tab**：包含产品需求文档
- **测试用例tab**：包含测试用例文档

逻辑说明作为原型的一部分，应放置在原型tab页的数据表格下方。

### 页面结构示意

```
页面结构
├── Tab导航（原型 | PRD | 测试用例）
├── 原型tab内容
│   ├── 搜索区域
│   ├── 数据表格
│   └── 逻辑说明 ← 放置在这里
├── PRD tab内容
└── 测试用例tab内容
```

## 1. 逻辑说明区域结构

每个原型页面底部都应包含逻辑说明区域，用于描述页面的业务逻辑。该区域可折叠展开。

```html
<!-- 逻辑说明 -->
<div class="bg-white rounded shadow-card mt-4 overflow-hidden">
    <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer" onclick="togglePrdLogic('[模块标识]')">
        <div class="flex items-center">
            <i class="fa fa-book text-primary mr-2"></i>
            <span class="font-semibold text-primary">逻辑说明</span>
            <span class="ml-2 text-xs text-gray-500">(点击展开/收起)</span>
        </div>
        <i class="fa fa-chevron-down text-primary transition-transform" id="[模块标识]-logic-icon"></i>
    </div>
    <div id="[模块标识]-logic-content">
        <!-- 在此插入逻辑说明内容 -->
    </div>
</div>
```

## 2. 初始化页面（数据展示逻辑）

```html
<!-- 初始化页面（数据展示逻辑） -->
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
                <!-- 更多行... -->
            </tbody>
        </table>
    </div>
</div>
```

## 3. 检索条件

```html
<!-- 检索条件 -->
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
                <!-- 更多行... -->
            </tbody>
        </table>
    </div>
</div>
```

## 4. 按钮逻辑

```html
<!-- 按钮逻辑 -->
<div class="p-4 border-b border-gray-100">
    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-mouse-pointer text-primary mr-2"></i>按钮逻辑
    </h4>
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">按钮</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">位置</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">触发动作</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">前置条件</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">后续操作</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[按钮名称]</td>
                    <td class="px-3 py-2 text-gray-600">页面右上角/每行操作列</td>
                    <td class="px-3 py-2 text-gray-600">打开弹窗/提交数据/删除确认</td>
                    <td class="px-3 py-2 text-gray-600">无/特定状态/权限校验</td>
                    <td class="px-3 py-2 text-gray-600">刷新列表/跳转页面/提示消息</td>
                </tr>
                <!-- 更多行... -->
            </tbody>
        </table>
    </div>
</div>
```

## 5. 属性取值逻辑

### 5.1 主表属性取值逻辑

```html
<!-- 属性取值逻辑（主表） -->
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
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[字段名称]</td>
                    <td class="px-3 py-2 text-gray-600">[字段说明]</td>
                    <td class="px-3 py-2 text-gray-600">键盘输入/手工选择/系统生成</td>
                    <td class="px-3 py-2 text-gray-600">[取值规则说明]</td>
                    <td class="px-3 py-2 text-gray-600">文本显示/数字/日期格式</td>
                </tr>
                <!-- 更多行... -->
            </tbody>
        </table>
    </div>
</div>
```

### 5.2 弹窗/表单属性取值逻辑

```html
<!-- 属性取值逻辑（弹窗/表单） -->
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
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-800">[字段名称]</td>
                    <td class="px-3 py-2 text-gray-600">[字段说明]</td>
                    <td class="px-3 py-2 text-gray-600">键盘输入/手工选择/系统生成</td>
                    <td class="px-3 py-2 text-gray-600">[取值规则说明]</td>
                    <td class="px-3 py-2 text-gray-600">文本显示/数字/日期格式</td>
                </tr>
                <!-- 更多行... -->
            </tbody>
        </table>
    </div>
</div>
```

## 6. 完整逻辑说明示例

```html
<!-- 逻辑说明 -->
<div class="bg-white rounded shadow-card mt-4 overflow-hidden">
    <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer" onclick="togglePrdLogic('warehouse')">
        <div class="flex items-center">
            <i class="fa fa-book text-primary mr-2"></i>
            <span class="font-semibold text-primary">逻辑说明</span>
            <span class="ml-2 text-xs text-gray-500">(点击展开/收起)</span>
        </div>
        <i class="fa fa-chevron-down text-primary transition-transform" id="warehouse-logic-icon"></i>
    </div>
    <div id="warehouse-logic-content">
        <!-- 初始化页面（数据展示逻辑） -->
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
                            <td class="px-3 py-2 text-gray-800">仓库列表加载</td>
                            <td class="px-3 py-2 text-gray-600">页面加载时展示所有仓库</td>
                            <td class="px-3 py-2 text-gray-600">仓库配置表</td>
                            <td class="px-3 py-2 text-gray-600">按创建时间倒序排列</td>
                            <td class="px-3 py-2 text-gray-600">默认展示授权账号所在部门的仓库</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">关联收费项统计</td>
                            <td class="px-3 py-2 text-gray-600">统计每个仓库关联的费用项数量</td>
                            <td class="px-3 py-2 text-gray-600">费用配置表</td>
                            <td class="px-3 py-2 text-gray-600">显示数字</td>
                            <td class="px-3 py-2 text-gray-600">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 检索条件 -->
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
                            <td class="px-3 py-2 text-gray-800">仓库</td>
                            <td class="px-3 py-2 text-gray-600">下拉单选框</td>
                            <td class="px-3 py-2 text-gray-600">根据选择仓库精确筛选</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 按钮逻辑 -->
        <div class="p-4 border-b border-gray-100">
            <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <i class="fa fa-mouse-pointer text-primary mr-2"></i>按钮逻辑
            </h4>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm border border-gray-200 rounded">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">按钮</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">位置</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">触发动作</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">前置条件</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">后续操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">设置</td>
                            <td class="px-3 py-2 text-gray-600">每行操作列</td>
                            <td class="px-3 py-2 text-gray-600">打开仓库费用设置弹窗</td>
                            <td class="px-3 py-2 text-gray-600">无</td>
                            <td class="px-3 py-2 text-gray-600">配置费用项后保存，刷新列表</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">重置</td>
                            <td class="px-3 py-2 text-gray-600">搜索区域</td>
                            <td class="px-3 py-2 text-gray-600">清空搜索条件</td>
                            <td class="px-3 py-2 text-gray-600">无</td>
                            <td class="px-3 py-2 text-gray-600">显示全部数据</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">搜索</td>
                            <td class="px-3 py-2 text-gray-600">搜索区域</td>
                            <td class="px-3 py-2 text-gray-600">根据条件筛选数据</td>
                            <td class="px-3 py-2 text-gray-600">无</td>
                            <td class="px-3 py-2 text-gray-600">显示筛选结果</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 属性取值逻辑 -->
        <div class="p-4">
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
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">仓库代码</td>
                            <td class="px-3 py-2 text-gray-600">定义的仓库代码</td>
                            <td class="px-3 py-2 text-gray-600">系统配置</td>
                            <td class="px-3 py-2 text-gray-600">直接取值</td>
                            <td class="px-3 py-2 text-gray-600">文本显示</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">仓库名称</td>
                            <td class="px-3 py-2 text-gray-600">定义的仓库名称</td>
                            <td class="px-3 py-2 text-gray-600">系统配置</td>
                            <td class="px-3 py-2 text-gray-600">直接取值</td>
                            <td class="px-3 py-2 text-gray-600">文本显示</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 text-gray-800">关联收费项</td>
                            <td class="px-3 py-2 text-gray-600">统计该仓库关联的费用项数量</td>
                            <td class="px-3 py-2 text-gray-600">系统计算</td>
                            <td class="px-3 py-2 text-gray-600">统计该仓库关联的费用项数量</td>
                            <td class="px-3 py-2 text-gray-600">数字</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
```
