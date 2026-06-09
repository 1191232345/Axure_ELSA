# 标签页组件

完整的标签页组件规范，包含样式、交互状态、HTML模板和JavaScript逻辑。

## 基础样式

### 线型标签页

```css
.tabs-header {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
}

.tab-item {
    position: relative;
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-600);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all var(--duration-150) var(--ease-smooth);
}

.tab-item:hover {
    color: var(--color-primary);
    background-color: var(--color-neutral-50);
}

.tab-item.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
}

.tab-item.disabled {
    color: var(--color-neutral-300);
    cursor: not-allowed;
    pointer-events: none;
}
```

### 卡片型标签页（Pills）

```css
.tab-pill {
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    padding: var(--spacing-2) var(--spacing-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-600);
    border-radius: var(--radius-xl);
    transition: all var(--duration-150) var(--ease-smooth);
}

.tab-pill:hover {
    color: var(--color-primary);
    background-color: var(--color-neutral-50);
}

.tab-pill.active {
    color: var(--color-neutral-50);
    background-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}
```

### 右下角浮动切换标签

```css
.tabs {
    display: flex;
    gap: 2px;
    background: linear-gradient(135deg, #667eea 0%, var(--color-primary) 100%);
    padding: 4px;
    border-radius: 12px;
    width: fit-content;
    box-shadow: 0 4px 20px rgba(42, 59, 125, 0.3);
}

.tab {
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover {
    color: white;
    transform: translateY(-1px);
}

.tab.active {
    background: white;
    color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-weight: 600;
}
```

### 逻辑说明面板Tab

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

## 内容区动画

```css
.tab-pane {
    display: none;
    animation: tabFadeIn var(--duration-300) var(--ease-out);
}

.tab-pane.active {
    display: block;
}

@keyframes tabFadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

## HTML模板

### 基础标签页（线型）

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

### 卡片型标签页（Pills）

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

### 逻辑说明面板Tab

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

## JavaScript逻辑

### 线型标签页切换

```javascript
function switchTab(tabButton, targetContentId) {
    var tabsContainer = tabButton.closest('.tabs-container');

    // 更新标签状态
    tabsContainer.querySelectorAll('.tab-item').forEach(function(tab) {
        tab.classList.remove('active', 'border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-neutral-600');
    });

    tabButton.classList.add('active', 'border-primary', 'text-primary');
    tabButton.classList.remove('border-transparent', 'text-neutral-600');

    // 切换内容区
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
    });

    var targetPane = document.getElementById(targetContentId);
    if (targetPane) targetPane.classList.remove('hidden');
}
```

### 卡片型标签页切换

```javascript
function switchTabPill(pillButton, targetContentId) {
    var tabsContainer = pillButton.closest('.tabs-container');

    // 更新标签状态
    tabsContainer.querySelectorAll('.tab-pill').forEach(function(pill) {
        pill.classList.remove('active', 'bg-white', 'shadow-sm', 'text-primary');
    });

    pillButton.classList.add('active', 'bg-white', 'shadow-sm', 'text-primary');

    // 切换内容区
    tabsContainer.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.add('hidden');
    });

    var targetPane = document.getElementById(targetContentId);
    if (targetPane) targetPane.classList.remove('hidden');
}
```

### 逻辑说明面板切换

```javascript
function switchLogicTab(tabName) {
    // 更新标签状态
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

## 使用规范

1. **标签数量**：建议不超过5个标签，避免界面拥挤
2. **标签文案**：简洁明了，建议2-4个字
3. **图标使用**：统一使用 Font Awesome 6，`mr-2` 表示图标与文字间距
4. **默认激活**：第一个标签默认添加 `active` 类
5. **禁用状态**：添加 `disabled` 类，自动应用禁用样式
6. **响应式**：标签头部支持横向滚动，适配移动端
