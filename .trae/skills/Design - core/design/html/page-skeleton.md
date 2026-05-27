# 页面骨架HTML

Header + Tab切换 + PRD区域 + Mermaid模态框 + 测试用例区域。

```html
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!-- 切换标签（固定右下角） -->
    <div class="tabs fixed bottom-8 right-8 z-40">
        <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
        <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
        <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
    </div>

    <!-- Header -->
    <header class="bg-primary text-white shadow-header sticky top-0 z-50">
        <div class="container mx-auto px-2 sm:px-3 lg:px-4">
            <div class="flex justify-between items-center h-14">
                <span class="text-lg font-semibold">ELSA</span>
            </div>
        </div>
    </header>

    <!-- PRD 区域 -->
    <main id="main-prd" class="main-content" style="display: none;">
        <div class="container mx-auto px-4 py-8">
            <div class="flex gap-6">
                <aside class="w-64 flex-shrink-0 hidden lg:block">
                    <div class="toc sticky top-4">
                        <div class="toc-title"><i class="fas fa-list-alt mr-2"></i>目录导航</div>
                        <div id="toc-nav"></div>
                    </div>
                </aside>
                <div class="flex-1 min-w-0">
                    <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                        <div id="prd-content" class="prose max-w-none"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Mermaid 放大模态框 -->
    <div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
        <div class="mermaid-modal-content" onclick="event.stopPropagation()">
            <button class="mermaid-modal-close" onclick="closeMermaidModal()"><i class="fas fa-xmark"></i></button>
            <div class="mermaid-modal-title"><i class="fas fa-diagram-project mr-2"></i>流程图预览</div>
            <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
        </div>
    </div>

    <!-- 测试用例区域 -->
    <main id="main-testcases" class="main-content" style="display: none;"></main>

    <!-- 原型主内容区（见 prototype.md） -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <!-- 见 prototype.md -->
    </main>

    <script src="/common/js/common.js"></script>
    <script src="js/main.js"></script>
</body>
```
