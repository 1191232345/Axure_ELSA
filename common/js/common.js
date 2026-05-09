/**
 * ELSA 原型公共脚本：Tab 切换、PRD/测试用例加载、Mermaid 放大
 */
(function () {
  var prdLoaded = false;
  var testCasesLoaded = false;

  function switchMainTab(tabName) {
    document.querySelectorAll('.tabs .tab').forEach(function (t) {
      t.classList.remove('active');
    });
    var tabBtn = document.getElementById('tab-' + tabName);
    if (tabBtn) tabBtn.classList.add('active');

    var proto = document.getElementById('main-prototype');
    var prd = document.getElementById('main-prd');
    var tc = document.getElementById('main-testcases');

    if (proto) {
      var show = tabName === 'prototype';
      proto.style.display = show ? 'flex' : 'none';
      proto.style.flexDirection = show ? 'column' : '';
      proto.classList.toggle('active', show);
    }
    if (prd) {
      var showPrd = tabName === 'prd';
      prd.style.display = showPrd ? 'block' : 'none';
      prd.classList.toggle('active', showPrd);
    }
    if (tc) {
      var showTc = tabName === 'testcases';
      tc.style.display = showTc ? 'block' : 'none';
      tc.classList.toggle('active', showTc);
    }

    if (tabName === 'prd' && !prdLoaded) {
      loadPRD();
    }
    if (tabName === 'testcases' && !testCasesLoaded) {
      loadTestCases();
    }
  }

  function openMermaidModal(container) {
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;

    var modal = document.getElementById('mermaidModal');
    var content = document.getElementById('mermaidModalContent');
    if (!modal || !content) return;

    content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
    modal.classList.add('active');
    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.init(undefined, content.querySelector('.mermaid'));
      } catch (e) {
        console.warn('mermaid init', e);
      }
    }
  }

  function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('active');
  }

  function loadPRD() {
    var prdContent = document.getElementById('prd-content');
    if (!prdContent) return;

    prdContent.innerHTML =
      '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';

    fetch('prd.md')
      .then(function (r) {
        return r.text();
      })
      .then(function (text) {
        if (typeof marked !== 'undefined') {
          prdContent.innerHTML = marked.parse(text);
          generateTOC();
        } else {
          prdContent.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
        }
        prdLoaded = true;
      })
      .catch(function () {
        prdContent.innerHTML =
          '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
        prdLoaded = true;
      });
  }

  function loadTestCases() {
    var container = document.getElementById('testcases-content');
    if (!container) return;

    container.innerHTML =
      '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';

    fetch('test-cases.md')
      .then(function (r) {
        return r.text();
      })
      .then(function (text) {
        if (typeof marked !== 'undefined') {
          container.innerHTML = marked.parse(text);
        } else {
          container.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
        }
        testCasesLoaded = true;
      })
      .catch(function () {
        container.innerHTML =
          '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无测试用例</p></div>';
        testCasesLoaded = true;
      });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
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
    headings.forEach(function (h, i) {
      if (!h.id) h.id = 'toc-heading-' + i;
      var level = h.tagName === 'H2' ? 2 : 3;
      var cls = level === 2 ? 'toc-level-2' : 'toc-level-3';
      html +=
        '<a class="' +
        cls +
        '" href="#' +
        h.id +
        '">' +
        escapeHtml(h.textContent || '') +
        '</a>';
    });
    tocNav.innerHTML = html;
  }

  window.switchMainTab = switchMainTab;
  window.openMermaidModal = openMermaidModal;
  window.closeMermaidModal = closeMermaidModal;
})();
