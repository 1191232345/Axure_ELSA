# 逻辑说明区域HTML（备选方案）

> ⚠️ 此方案为备选，推荐使用 [水平分栏布局](logic-panel-split-view.md)

可折叠的逻辑说明区域，放置在原型tab页数据表格下方。

```html
<div class="bg-white rounded shadow-card mt-4 overflow-hidden">
    <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all"
         onclick="toggleLogic()">
        <div class="flex items-center">
            <i class="fas fa-book text-primary mr-2"></i>
            <span class="font-semibold text-primary">逻辑说明</span>
        </div>
        <i class="fas fa-chevron-down text-primary transition-transform duration-300" id="logicIcon"></i>
    </div>
    <div id="logicContent" class="hidden p-4 bg-gray-50/50">
        <div class="space-y-6">
            <!-- 初始化页面 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-play-circle text-primary mr-2"></i>初始化页面（数据展示逻辑）
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">数据项</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">取值规则</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">展示规则</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 检索条件 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-filter text-primary mr-2"></i>检索条件
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">筛选项</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">输入方式</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">查询逻辑</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 按钮逻辑 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-hand-pointer text-primary mr-2"></i>按钮逻辑
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">按钮</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">触发动作</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">前置条件</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">后续操作</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="4">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 属性取值逻辑 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-list-alt text-primary mr-2"></i>属性取值逻辑
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">字段</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">说明</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">数据来源</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">取值规则</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">存储类型</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="5">待补充...</td></tr></tbody>
                </table>
            </section>
        </div>
    </div>
</div>
```
