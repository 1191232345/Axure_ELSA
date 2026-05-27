# 内容加载器

PRD 文档和测试用例的 Markdown 加载与目录生成。

## 方法

```javascript
function loadPRD()
function loadTestCases()
function generateTOC()
```

## 完整代码

```javascript
function loadPRD() {
    var prdContent = document.getElementById('prd-content');
    if (!prdContent) return;
    
    prdContent.innerHTML = '<div class="text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('prd.md')
        .then(function(r) { return r.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                prdContent.innerHTML = marked.parse(text);
                generateTOC();
            } else {
                prdContent.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
            }
        })
        .catch(function() {
            prdContent.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fas fa-file-alt text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
        });
}

function loadTestCases() {
    var container = document.getElementById('testcases-content') || document.getElementById('main-testcases');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('test-cases.md')
        .then(function(r) { return r.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                container.innerHTML = marked.parse(text);
            } else {
                container.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
            }
        })
        .catch(function() {
            container.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fas fa-file-alt text-4xl mb-4"></i><p>暂无测试用例</p></div>';
        });
}

function generateTOC() {
    var tocNav = document.getElementById('toc-nav');
    var prdContent = document.getElementById('prd-content');
    if (!tocNav || !prdContent) return;
    
    var headings = prdContent.querySelectorAll('h2, h3');
    if (!headings.length) {
        tocNav.innerHTML = '';
        return;
    }
    
    var html = '';
    headings.forEach(function(h, i) {
        if (!h.id) h.id = 'toc-heading-' + i;
        var level = h.tagName === 'H2' ? 2 : 3;
        var cls = level === 2 ? 'toc-level-2' : 'toc-level-3';
        html += '<a class="' + cls + '" href="#' + h.id + '">' + escapeHtml(h.textContent || '') + '</a>';
    });
    tocNav.innerHTML = html;
}
```

## 依赖

- `marked.js`：Markdown 解析库
- `escapeHtml`：HTML 转义函数，见 [format](format.md)