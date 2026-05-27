# 空状态组件

无数据、搜索无结果、错误状态模板。

## 无数据空状态

```html
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-inbox text-7xl text-neutral-300"></i>
    </div>
    <h3 class="text-xl font-semibold text-neutral-600 mb-2">暂无数据</h3>
    <p class="text-sm text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
        当前列表为空，您可以点击下方按钮添加新数据开始使用
    </p>
    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
            <i class="fas fa-plus mr-2"></i>立即添加
        </button>
        <button class="erp-btn erp-btn-secondary" onclick="handleRefresh()">
            <i class="fas fa-refresh mr-2"></i>刷新数据
        </button>
    </div>
</div>
```

## 搜索无结果

```html
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-magnifying-glass text-7xl text-neutral-300"></i>
    </div>
    <h3 class="text-xl font-semibold text-neutral-600 mb-2">未找到匹配结果</h3>
    <p class="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
        没有找到符合"<span class="font-medium text-primary">关键词</span>"的数据
    </p>
    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-secondary" onclick="handleResetFilters()">
            <i class="fas fa-filter-circle-xmark mr-2"></i>重置筛选
        </button>
        <button class="erp-btn erp-btn-outline" onclick="clearSearchInput()">
            <i class="fas fa-xmark mr-2"></i>清除搜索词
        </button>
    </div>
</div>
```

## 错误状态

```html
<div class="empty-state text-center py-16 px-4">
    <div class="empty-state-icon mb-6">
        <i class="fas fa-triangle-exclamation text-7xl text-danger/30"></i>
    </div>
    <h3 class="text-xl font-semibold text-neutral-700 mb-2">加载失败</h3>
    <p class="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
        数据加载遇到问题，可能是网络连接中断或服务器暂时不可用
    </p>
    <div class="flex justify-center gap-3">
        <button class="erp-btn erp-btn-primary" onclick="retryLoadData()">
            <i class="fas fa-rotate-right mr-2"></i>重新加载
        </button>
        <button class="erp-btn erp-btn-secondary" onclick="showErrorDetails()">
            <i class="fas fa-code mr-2"></i>查看详情
        </button>
    </div>
</div>
```

## CSS样式

```css
.empty-state {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```