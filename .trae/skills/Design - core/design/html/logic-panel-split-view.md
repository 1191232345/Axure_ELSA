# 水平分栏布局模板

左侧原型界面 + 右侧逻辑说明面板，解决原有"页面下方折叠区域"方案开发阅读体验不佳的问题。

> 推荐方案：逻辑说明始终可见，可折叠，可拖拽调整比例

## 布局结构

```
┌────────────────────────────────────────────────────────────┐
│  Header                              [逻辑说明] 🔔 👤      │
├─────────────────────────┬┬─────────────────────────────────┤
│                         ││ 📖 逻辑说明              [»]    │
│  筛选条件               ││ [初始化][检索条件][按钮逻辑][属性]│
│                         ││ ┌─────────────────────────────┐ │
│  操作按钮               ││ │ 逻辑项 | 说明 | 来源 | 规则 │ │
│                         │↕ │ ...   | ...  | ...  | ...  │ │
│  数据表格               ││ └─────────────────────────────┘ │
│                         ││                                  │
│  分页                   ││                                  │
├─────────────────────────┴┴─────────────────────────────────┤
```

## 核心交互

| 功能 | 操作方式 |
|------|---------|
| 拖拽调整比例 | 拖动分隔条，左侧最小30%，最大75% |
| 双击恢复默认 | 双击分隔条，恢复60:40 |
| 折叠面板 | 右侧浮动按钮 / Header按钮 / 面板头部按钮 |
| 展开面板 | 右侧边缘浮动按钮（hover变金色+箭头动画） |
| Tab切换 | 点击Tab栏切换逻辑说明内容 |
| 快捷键 | ⌘B / Ctrl+B 快速切换面板 |

## HTML结构

```html
<div class="split-container">
  <!-- 左侧原型界面 -->
  <div class="split-left">
    <div class="container mx-auto px-4 py-6">
      <!-- 筛选条件 -->
      <!-- 操作按钮 -->
      <!-- 数据表格 -->
      <!-- 分页 -->
    </div>
  </div>

  <!-- 可拖拽分隔条 -->
  <div class="split-divider">
    <div class="divider-grip">
      <div class="divider-grip-dot"></div>
      <div class="divider-grip-dot"></div>
      <div class="divider-grip-dot"></div>
      <div class="divider-grip-dot"></div>
      <div class="divider-grip-dot"></div>
      <div class="divider-grip-dot"></div>
    </div>
  </div>

  <!-- 右侧逻辑说明面板 -->
  <div class="split-right">
    <div class="logic-content">
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="panel-header-title">
          <div class="title-icon"><i class="fas fa-book-open"></i></div>
          逻辑说明
          <span class="shortcut-hint">⌘B</span>
        </div>
        <div class="collapse-btn" onclick="toggleLogicPanel()">
          <i class="fas fa-angles-right"></i>
        </div>
      </div>

      <!-- Tab栏 -->
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

      <!-- Tab内容区域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="logic-section-panel active" id="panel-init">
          <div class="overflow-x-auto">
            <table class="logic-table">...</table>
          </div>
        </div>
        <!-- 其他Tab内容... -->
      </div>
    </div>
  </div>
</div>

<!-- 折叠态浮动展开按钮 -->
<div class="expand-btn" id="expandBtn" onclick="toggleLogicPanel()">
  <i class="fas fa-chevron-left"></i>
</div>
```

## CSS样式要点

### 分隔条设计
```css
.split-divider {
  width: 12px;
  cursor: col-resize;
  background: transparent;
}

.split-divider::before {
  content: '';
  position: absolute;
  left: 5px;
  width: 2px;
  background: #E8E5DF;
  transition: all 0.25s ease;
}

.split-divider:hover::before {
  width: 4px;
  background: #E8A838; /* accent色 */
}
```

### 折叠态过渡动画
```css
.split-right {
  transition: min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.split-right.collapsed {
  min-width: 0 !important;
  max-width: 0 !important;
}
```

### Tab彩色图标
```css
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

## JavaScript逻辑

### 状态管理
```javascript
const STORAGE_KEY = 'elsa-split-view-state';
let currentRatio = 0.6;  // 左侧占比
let isCollapsed = false;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state = JSON.parse(saved);
    currentRatio = state.ratio || 0.6;
    isCollapsed = state.collapsed || false;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ratio: currentRatio,
    collapsed: isCollapsed
  }));
}
```

### 拖拽逻辑
```javascript
splitDivider.addEventListener('mousedown', function(e) {
  if (isCollapsed) return;
  isDragging = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  splitRight.style.transition = 'none'; // 拖拽时禁用过渡
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  const ratio = (e.clientX - containerRect.left) / availableWidth;
  currentRatio = Math.max(0.3, Math.min(0.75, ratio));
  splitLeft.style.flex = `0 0 ${currentRatio * 100}%`;
  splitRight.style.flex = `0 0 ${(1 - currentRatio) * 100}%`;
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = '';
    splitRight.style.transition = '';
    saveState();
  }
});
```

### 快捷键
```javascript
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
    e.preventDefault();
    toggleLogicPanel();
  }
});
```

## 重要提醒

### Tailwind CDN限制
**Tailwind CDN JIT模式不支持 `<style>` 标签中的 `@apply` 指令**

所有样式必须使用原生CSS属性，例如：
```css
/* 错误 - 不生效 */
.logic-table {
  @apply w-full text-sm border border-border;
}

/* 正确 */
.logic-table {
  width: 100%;
  font-size: 0.875rem;
  border: 1px solid #D8D5CE;
}
```

### 表格样式
逻辑说明表格需要设置 `border-collapse: separate` 和 `border-spacing: 0` 以配合圆角边框：
```css
.logic-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}
```

## 完整示例

参考文件：`/Users/zsw/Desktop/Axure_ELSA/水平分栏demo/index.html`