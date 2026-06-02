# 标签页组件

标签页切换模板，包含线型标签页、卡片型标签页和逻辑说明面板Tab。

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

## 逻辑说明面板Tab（带彩色图标方块）

用于水平分栏布局右侧逻辑说明面板，每个Tab带彩色图标方块，视觉层级更清晰。

```html
<div class="logic-tab-bar">
    <div class="logic-tab active" data-tab="init" onclick="switchLogicTab('init')">
        <span class="tab-icon icon-init"><i class="fas fa-play"></i></span>
        初始化
    </div>
    <div class="logic-tab" data-tab="search" onclick="switchLogicTab('search')">
        <span class="tab-icon icon-search"><i class="fas fa-filter"></i></span>
        检索条件
    </div>
    <div class="logic-tab" data-tab="button" onclick="switchLogicTab('button')">
        <span class="tab-icon icon-button"><i class="fas fa-hand-pointer"></i></span>
        按钮逻辑
    </div>
    <div class="logic-tab" data-tab="field" onclick="switchLogicTab('field')">
        <span class="tab-icon icon-field"><i class="fas fa-list-alt"></i></span>
        属性取值
    </div>
</div>
```

### CSS样式

```css
.logic-tab-bar {
    display: flex;
    gap: 4px;
    padding: 8px 12px 0;
    background: white;
    border-bottom: 1px solid #E8E5DF;
}

.logic-tab {
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #5A6275;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    border: 1px solid transparent;
    border-bottom: none;
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
}

.logic-tab:hover {
    color: #1B3A4B;
    background: #F5F3EF;
}

.logic-tab.active {
    color: #1B3A4B;
    background: white;
    border-color: #E8E5DF;
}

.logic-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: white;
}

.logic-tab .tab-icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}

.logic-tab .tab-icon.icon-init {
    background: #E8F5E9;
    color: #2D936C;
}

.logic-tab .tab-icon.icon-search {
    background: #E3F2FD;
    color: #1976D2;
}

.logic-tab .tab-icon.icon-button {
    background: #FFF3E0;
    color: #E8A838;
}

.logic-tab .tab-icon.icon-field {
    background: #F3E5F5;
    color: #7B1FA2;
}
```

### JavaScript

```javascript
function switchLogicTab(tabName) {
    document.querySelectorAll('.logic-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    document.querySelectorAll('.logic-section-panel').forEach(function(p) {
        p.classList.remove('active');
    });

    var tab = document.querySelector('.logic-tab[data-tab="' + tabName + '"]');
    var panel = document.getElementById('panel-' + tabName);

    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
}
```