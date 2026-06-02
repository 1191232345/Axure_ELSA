window.MarkdownRenderer = (function () {
    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {
                    console.error(e);
                }
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true,
    });

    function render(markdown) {
        if (!markdown) return '';
        return marked.parse(markdown);
    }

    function renderPlain(markdown) {
        if (!markdown) return '';
        var html = marked.parse(markdown);
        var temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    return {
        render: render,
        renderPlain: renderPlain,
    };
})();