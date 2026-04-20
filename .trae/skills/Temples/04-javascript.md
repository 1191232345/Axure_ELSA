# JavaScript 交互模板

本文件包含TOB产品的核心 JavaScript 交互函数。

**注意：按钮交互逻辑（搜索、新增、编辑、删除、导出、审批等）请参考 [13-button-interaction.md](13-button-interaction.md)**

## 1. 主标签切换

```javascript
function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(function(content) {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    document.querySelectorAll('.tab').forEach(function(t) {
        t.classList.remove('active');
    });
    
    const targetContent = document.getElementById('main-' + tab);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }
    
    const targetTab = document.getElementById('tab-' + tab);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tab === 'prd' && !prdLoaded) {
        loadPRD();
    } else if (tab === 'testcases' && !testCasesLoaded) {
        loadTestCases();
    }
}
```

## 2. Mermaid 图表放大预览

```javascript
function openMermaidModal(container) {
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    const modal = document.getElementById('mermaidModal');
    const modalContent = document.getElementById('mermaidModalContent');
    
    modalContent.innerHTML = mermaidDiv.innerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (window.mermaid) {
        mermaid.init(undefined, modalContent.querySelectorAll('.mermaid'));
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget && !event.target.closest('.mermaid-modal-close')) {
        return;
    }
    
    const modal = document.getElementById('mermaidModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMermaidModal();
    }
});
```

## 3. 加载 PRD 文档

```javascript
let prdLoaded = false;
let testCasesLoaded = false;

function loadPRD() {
    if (prdLoaded) return;
    
    const prdContentDiv = document.getElementById('prd-content');
    
    if (typeof marked === 'undefined') {
        prdContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载</p></div>';
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'prd.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const markdown = xhr.responseText;
            const html = marked.parse(markdown);
            prdContentDiv.innerHTML = html;
            generateTOC();
            
            if (window.mermaid) {
                setTimeout(function() {
                    mermaid.init(undefined, prdContentDiv.querySelectorAll('.mermaid'));
                }, 100);
            }
            
            prdLoaded = true;
        }
    };
    xhr.send();
}
```

## 4. 加载测试用例文档

```javascript
function loadTestCases() {
    if (testCasesLoaded) return;
    
    const testCasesContentDiv = document.getElementById('testcases-content');
    
    if (typeof marked === 'undefined') {
        testCasesContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载</p></div>';
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'test-cases.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const markdown = xhr.responseText;
            const html = marked.parse(markdown);
            testCasesContentDiv.innerHTML = html;
            generateTestCasesTOC();
            
            if (window.mermaid) {
                setTimeout(function() {
                    mermaid.init(undefined, testCasesContentDiv.querySelectorAll('.mermaid'));
                }, 100);
            }
            
            testCasesLoaded = true;
        }
    };
    xhr.send();
}
```

## 5. 生成目录导航

```javascript
function generateTOC() {
    const tocNav = document.getElementById('toc-nav');
    const headings = document.querySelectorAll('#prd-content h1, #prd-content h2, #prd-content h3');
    
    let tocHTML = '';
    headings.forEach(function(heading, index) {
        const id = 'heading-' + index;
        heading.id = id;
        
        const level = parseInt(heading.tagName.substring(1));
        const className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}

function generateTestCasesTOC() {
    const tocNav = document.getElementById('testcases-toc-nav');
    const headings = document.querySelectorAll('#testcases-content h1, #testcases-content h2, #testcases-content h3');
    
    let tocHTML = '';
    headings.forEach(function(heading, index) {
        const id = 'testcases-heading-' + index;
        heading.id = id;
        
        const level = parseInt(heading.tagName.substring(1));
        const className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}
```

## 6. 切换逻辑说明展开/收起

```javascript
function togglePrdLogic(module) {
    const content = document.getElementById(module + '-logic-content');
    const icon = document.getElementById(module + '-logic-icon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}
```

## 7. 页面切换（原型内多页面）

```javascript
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}
```

## 8. 页面加载完成后初始化

```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面初始化完成');
});
```

## 9. 模态框/对话框操作

**模态框/对话框操作请参考 [13-button-interaction.md](13-button-interaction.md) 的第 8 节"确认对话框组件"**

## 10. 按钮交互逻辑

**完整的按钮交互逻辑请参考 [13-button-interaction.md](13-button-interaction.md)**

包含：
- 搜索/筛选按钮逻辑
- 新增按钮逻辑
- 编辑按钮逻辑
- 删除按钮逻辑
- 状态切换按钮逻辑
- 导出按钮逻辑
- 审批按钮逻辑
- 确认对话框组件
- 加载状态组件
- Toast 消息组件
- 分页逻辑
- 表格选择逻辑
