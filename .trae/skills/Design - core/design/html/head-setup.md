# 文件结构与Head配置

模块化文件结构 + CDN依赖 + Tailwind/Mermaid/Marked配置。

## 文件结构

```
[模块目录]/
├── index.html
├── css/styles.css
├── js/main.js
├── data/[page_id]-data.json
├── prd.md
└── test-cases.md

公共资源（项目根目录）/
├── common/css/common.css
└── common/js/common.js
```

## CDN 依赖

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.3/dist/mermaid.min.js"></script>
<link rel="stylesheet" href="/common/css/common.css">
<link rel="stylesheet" href="css/styles.css">
```

## Tailwind 配置

完整配置见 [tokens/tailwind-config](../tokens/tailwind-config.md)。精简版：

```html
<script>
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#2a3b7d', light: '#3a4ca7', dark: '#1e2d5f' },
                success: { DEFAULT: '#00B42A', bg: '#E8FFEC', text: '#006B19' },
                warning: { DEFAULT: '#FF7D00', bg: '#FFF7E8', text: '#994D00' },
                danger: { DEFAULT: '#F53F3F', bg: '#FFECE8', text: '#B3261E' },
                info: { DEFAULT: '#1677FF', bg: '#E8F3FF', text: '#094D8C' }
            }
        }
    }
};

mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });

const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: '[模块目录]/data/[page_id]-data.json',
    version: '2.0.0'
};
</script>
```

## Marked 渲染器

```javascript
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
    if (language === 'mermaid') {
        return '<div class="mermaid-container" onclick="openMermaidModal(this)">' +
               '<div class="mermaid">' + code + '</div>' +
               '<span class="mermaid-hint"><i class="fas fa-magnifying-glass-plus mr-1"></i>点击放大</span></div>';
    }
    return '<pre><code class="language-' + (language || '') + '">' +
           code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>';
};
marked.setOptions({ renderer, breaks: true, gfm: true });
```
