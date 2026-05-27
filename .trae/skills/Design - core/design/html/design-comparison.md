# 设计方案对比模板（v1.0）

用于在原型中对比多个设计方案，支持标签页切换。

---

## 使用场景

- 对比不同布局方案
- 对比不同交互方式
- 对比不同视觉风格
- 对比不同组件选型

---

## HTML 结构

### 完整模板

```html
<!-- 方案导航（固定顶部） -->
<div class="option-nav sticky top-0 bg-white border-b border-neutral-200 p-3 z-10 mb-4">
    <div class="flex gap-2">
        <button class="option-btn active px-4 py-2 rounded bg-primary text-white" onclick="showOption('a')">
            A. 方案一名称
        </button>
        <button class="option-btn px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onclick="showOption('b')">
            B. 方案二名称
        </button>
        <button class="option-btn px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onclick="showOption('c')">
            C. 方案三名称
        </button>
    </div>
</div>

<!-- 方案内容区域 -->
<div class="mockup-container">
    
    <!-- 方案 A -->
    <div class="mockup-section active" id="section-a">
        <!-- 方案A的原型内容 -->
        <div class="bg-white rounded shadow-card p-6">
            <h3 class="text-lg font-medium mb-4">方案A：[具体方案名称]</h3>
            <!-- 原型界面 -->
            <div class="border border-neutral-200 rounded p-4">
                <!-- 方案A的具体实现 -->
            </div>
        </div>
        
        <!-- 方案A的优缺点分析 -->
        <div class="analysis-block mt-6 p-4 bg-gray-50 rounded border border-neutral-200">
            <h4 class="font-medium mb-3">优点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>优点1：具体描述</li>
                <li>优点2：具体描述</li>
                <li>优点3：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">缺点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>缺点1：具体描述</li>
                <li>缺点2：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">适用场景</h4>
            <p class="text-sm text-gray-700">描述方案A最适合的使用场景。</p>
        </div>
    </div>
    
    <!-- 方案 B -->
    <div class="mockup-section" id="section-b" style="display:none">
        <!-- 方案B的原型内容 -->
        <div class="bg-white rounded shadow-card p-6">
            <h3 class="text-lg font-medium mb-4">方案B：[具体方案名称]</h3>
            <!-- 原型界面 -->
            <div class="border border-neutral-200 rounded p-4">
                <!-- 方案B的具体实现 -->
            </div>
        </div>
        
        <!-- 方案B的优缺点分析 -->
        <div class="analysis-block mt-6 p-4 bg-gray-50 rounded border border-neutral-200">
            <h4 class="font-medium mb-3">优点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>优点1：具体描述</li>
                <li>优点2：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">缺点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>缺点1：具体描述</li>
                <li>缺点2：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">适用场景</h4>
            <p class="text-sm text-gray-700">描述方案B最适合的使用场景。</p>
        </div>
    </div>
    
    <!-- 方案 C -->
    <div class="mockup-section" id="section-c" style="display:none">
        <!-- 方案C的原型内容 -->
        <div class="bg-white rounded shadow-card p-6">
            <h3 class="text-lg font-medium mb-4">方案C：[具体方案名称]</h3>
            <!-- 原型界面 -->
            <div class="border border-neutral-200 rounded p-4">
                <!-- 方案C的具体实现 -->
            </div>
        </div>
        
        <!-- 方案C的优缺点分析 -->
        <div class="analysis-block mt-6 p-4 bg-gray-50 rounded border border-neutral-200">
            <h4 class="font-medium mb-3">优点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>优点1：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">缺点</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>缺点1：具体描述</li>
            </ul>
            
            <h4 class="font-medium mb-3 mt-4">适用场景</h4>
            <p class="text-sm text-gray-700">描述方案C最适合的使用场景。</p>
        </div>
    </div>
    
</div>

<!-- JavaScript 切换逻辑 -->
<script>
function showOption(id) {
    // 隐藏所有方案
    document.querySelectorAll('.mockup-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // 移除所有按钮的激活状态
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    // 显示选中的方案
    const targetSection = document.getElementById('section-' + id);
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    
    // 激活选中的按钮
    event.target.classList.remove('bg-gray-100', 'text-gray-700');
    event.target.classList.add('active', 'bg-primary', 'text-white');
}
</script>
```

---

## CSS 样式

### 基础样式（Tailwind CSS）

```html
<!-- 使用 Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<style>
/* 自定义样式 */
.option-nav {
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px;
    z-index: 10;
}

.option-btn {
    transition: all 0.2s ease;
}

.option-btn:hover {
    transform: translateY(-1px);
}

.mockup-section {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.analysis-block {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
}
</style>
```

---

## 实际案例示例

### 案例1：列表布局对比

```html
<!-- 方案导航 -->
<div class="option-nav sticky top-0 bg-white border-b p-3 z-10">
    <div class="flex gap-2">
        <button class="option-btn active px-4 py-2 rounded bg-primary text-white" onclick="showOption('a')">
            A. 表格布局
        </button>
        <button class="option-btn px-4 py-2 rounded bg-gray-100" onclick="showOption('b')">
            B. 卡片布局
        </button>
        <button class="option-btn px-4 py-2 rounded bg-gray-100" onclick="showOption('c')">
            C. 树形布局
        </button>
    </div>
</div>

<!-- 方案A：表格布局 -->
<div class="mockup-section active" id="section-a">
    <div class="bg-white rounded shadow p-6">
        <h3 class="text-lg font-medium mb-4">方案A：表格布局</h3>
        
        <!-- 表格原型 -->
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left">序号</th>
                    <th class="px-4 py-3 text-left">名称</th>
                    <th class="px-4 py-3 text-left">状态</th>
                    <th class="px-4 py-3 text-left">操作</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr>
                    <td class="px-4 py-3">1</td>
                    <td class="px-4 py-3">仓库A</td>
                    <td class="px-4 py-3"><span class="badge badge-success">启用</span></td>
                    <td class="px-4 py-3">
                        <button class="text-primary">编辑</button>
                        <button class="text-red-500 ml-2">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- 优缺点 -->
    <div class="analysis-block mt-6 p-4 bg-gray-50 rounded">
        <h4 class="font-medium mb-3">优点</h4>
        <ul class="list-disc list-inside text-sm space-y-1">
            <li>信息密度高，适合大量数据展示</li>
            <li>便于排序、筛选、对比</li>
            <li>符合用户传统认知习惯</li>
        </ul>
        
        <h4 class="font-medium mb-3 mt-4">缺点</h4>
        <ul class="list-disc list-inside text-sm space-y-1">
            <li>移动端体验较差</li>
            <li>视觉层次感较弱</li>
        </ul>
        
        <h4 class="font-medium mb-3 mt-4">适用场景</h4>
        <p class="text-sm">适合后台管理系统、数据报表、批量操作场景。</p>
    </div>
</div>

<!-- 方案B：卡片布局 -->
<div class="mockup-section" id="section-b" style="display:none">
    <div class="bg-white rounded shadow p-6">
        <h3 class="text-lg font-medium mb-4">方案B：卡片布局</h3>
        
        <!-- 卡片原型 -->
        <div class="grid grid-cols-3 gap-4">
            <div class="border rounded p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium">仓库A</h4>
                    <span class="badge badge-success">启用</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">描述信息...</p>
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary">编辑</button>
                    <button class="btn btn-sm btn-danger">删除</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 优缺点 -->
    <div class="analysis-block mt-6 p-4 bg-gray-50 rounded">
        <h4 class="font-medium mb-3">优点</h4>
        <ul class="list-disc list-inside text-sm space-y-1">
            <li>视觉层次感强</li>
            <li>移动端体验好</li>
            <li>便于展示更多信息</li>
        </ul>
        
        <h4 class="font-medium mb-3 mt-4">缺点</h4>
        <ul class="list-disc list-inside text-sm space-y-1">
            <li>信息密度低</li>
            <li>不适合大量数据</li>
        </ul>
        
        <h4 class="font-medium mb-3 mt-4">适用场景</h4>
        <p class="text-sm">适合商品展示、内容管理、移动端场景。</p>
    </div>
</div>

<!-- JavaScript -->
<script>
function showOption(id) {
    document.querySelectorAll('.mockup-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    document.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('active', 'bg-primary', 'text-white');
        b.classList.add('bg-gray-100');
    });
    
    const target = document.getElementById('section-' + id);
    target.style.display = 'block';
    target.classList.add('active');
    
    event.target.classList.remove('bg-gray-100');
    event.target.classList.add('active', 'bg-primary', 'text-white');
}
</script>
```

---

## 关键规则

### 1. 结构规则

- ✅ 导航栏固定顶部（`sticky top-0`）
- ✅ 每个方案独立容器（`.mockup-section`）
- ✅ 优缺点分析放在方案容器**内部**
- ✅ 默认只显示第一个方案（`active`）

### 2. 交互规则

- ✅ 点击按钮切换方案
- ✅ 切换时有淡入动画
- ✅ 激活按钮有视觉反馈
- ✅ 使用 `display:none` 控制显示

### 3. 内容规则

- ✅ 使用真实数据，不用占位符
- ✅ 优缺点描述具体明确
- ✅ 适用场景清晰可执行
- ✅ 方案命名简洁易懂

---

## 最佳实践

### 1. 方案数量

- 推荐：2-3个方案
- 最大：不超过4个方案
- 原因：过多方案增加决策难度

### 2. 对比维度

| 维度 | 说明 |
|------|------|
| **视觉效果** | 界面美观度、层次感 |
| **用户体验** | 操作便捷性、认知负担 |
| **技术实现** | 开发难度、维护成本 |
| **性能表现** | 加载速度、响应时间 |
| **适用场景** | 最佳使用环境 |

### 3. 决策建议

在对比文档末尾添加：

```html
<!-- 决策建议 -->
<div class="decision-block mt-8 p-4 bg-blue-50 rounded border border-blue-200">
    <h4 class="font-medium mb-3 text-blue-900">推荐方案</h4>
    <p class="text-sm text-blue-800">
        基于以上对比，推荐采用<strong>方案A</strong>，原因如下：
    </p>
    <ul class="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
        <li>符合业务需求优先级</li>
        <li>用户体验最佳</li>
        <li>技术实现可行</li>
    </ul>
</div>
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v1.0** | 2026-05-27 | 初始版本：标签页切换、优缺点分析、实际案例 |