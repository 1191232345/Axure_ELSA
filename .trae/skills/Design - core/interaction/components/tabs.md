# 标签页组件

标签页切换模板，包含线型标签页和卡片型标签页。

## 基础标签页（线型）

```html
<div class="tabs-container">
    <!-- 标签头部 -->
    <div class="tabs-header flex border-b border-neutral-200" role="tablist">
        <button class="tab-item active px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary"
                role="tab" onclick="switchTab(this, 'tab-content-1')">
            <i class="fas fa-table-list mr-2"></i>基本信息
        </button>
        <button class="tab-item px-4 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-primary"
                role="tab" onclick="switchTab(this, 'tab-content-2')">
            <i class="fas fa-paperclip mr-2"></i>附件管理
        </button>
        <button class="tab-item px-4 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-primary"
                role="tab" onclick="switchTab(this, 'tab-content-3')">
            <i class="fas fa-clock-rotate-left mr-2"></i>操作日志
        </button>
    </div>

    <!-- 标签内容区 -->
    <div class="tabs-content pt-4">
        <div id="tab-content-1" class="tab-pane active" role="tabpanel">
            <p class="text-sm text-neutral-600">基本信息内容区域...</p>
        </div>
        <div id="tab-content-2" class="tab-pane hidden" role="tabpanel">
            <p class="text-sm text-neutral-600">附件管理内容区域...</p>
        </div>
        <div id="tab-content-3" class="tab-pane hidden" role="tabpanel">
            <p class="text-sm text-neutral-600">操作日志内容区域...</p>
        </div>
    </div>
</div>
```

## 卡片型标签页（Pills）

```html
<div class="tabs-container">
    <div class="tabs-header flex gap-2 p-1 bg-neutral-100 rounded-lg" role="tablist">
        <button class="tab-pill active flex-1 px-4 py-2 text-sm font-medium bg-white rounded-md shadow-sm text-primary"
                onclick="switchTabPill(this, 'pill-content-1')">
            <i class="fas fa-chart-simple mr-2"></i>数据统计
        </button>
        <button class="tab-pill flex-1 px-4 py-2 text-sm font-medium text-neutral-600 rounded-md"
                onclick="switchTabPill(this, 'pill-content-2')">
            <i class="fas fa-chart-line mr-2"></i>趋势分析
        </button>
    </div>
    <div class="tabs-content mt-4">
        <div id="pill-content-1" class="tab-pane active" role="tabpanel"></div>
        <div id="pill-content-2" class="tab-pane hidden" role="tabpanel"></div>
    </div>
</div>
```

## JavaScript

```javascript
function switchTab(tabButton, targetContentId) {
    var tabsContainer = tabButton.closest('.tabs-container');
    
    tabsContainer.querySelectorAll('.tab-item').forEach(function(tab) {
        tab.classList.remove('active', 'border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-neutral-600');
    });
    
    tabButton.classList.add('active', 'border-primary', 'text-primary');
    tabButton.classList.remove('border-transparent', 'text-neutral-600');
    
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
    });
    
    var targetPane = document.getElementById(targetContentId);
    if (targetPane) targetPane.classList.remove('hidden');
}

function switchTabPill(pillButton, targetContentId) {
    var tabsContainer = pillButton.closest('.tabs-container');
    
    tabsContainer.querySelectorAll('.tab-pill').forEach(function(pill) {
        pill.classList.remove('active', 'bg-white', 'shadow-sm', 'text-primary');
    });
    
    pillButton.classList.add('active', 'bg-white', 'shadow-sm', 'text-primary');
    
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
    });
    
    var targetPane = document.getElementById(targetContentId);
    if (targetPane) targetPane.classList.remove('hidden');
}
```