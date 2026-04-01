// 页面模块加载器
class PageLoader {
    constructor() {
        this.currentPage = 'organization';
        this.cache = {};
        this.init();
    }

    init() {
        this.loadPage('organization');
        this.loadModals();
    }

    async loadPage(pageName) {
        const container = document.getElementById('page-container');
        
        if (this.cache[pageName]) {
            container.innerHTML = this.cache[pageName];
            this.currentPage = pageName;
            this.updateActiveState();
            return;
        }

        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            this.cache[pageName] = html;
            container.innerHTML = html;
            this.currentPage = pageName;
            this.updateActiveState();
            
            // 重新初始化Mermaid图表
            if (typeof mermaid !== 'undefined') {
                setTimeout(() => {
                    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                }, 100);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            container.innerHTML = `
                <div class="bg-white rounded shadow-card p-8 text-center">
                    <i class="fa fa-exclamation-triangle text-5xl text-warning mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">页面加载失败</h3>
                    <p class="text-gray-600 mb-4">无法加载页面: ${pageName}</p>
                    <button onclick="pageLoader.loadPage('${pageName}')" class="erp-btn erp-btn-primary">
                        <i class="fa fa-refresh mr-1.5"></i>重新加载
                    </button>
                </div>
            `;
        }
    }

    async loadModals() {
        const container = document.getElementById('modals-container');
        
        if (this.cache['modals']) {
            container.innerHTML = this.cache['modals'];
            return;
        }

        try {
            const response = await fetch('pages/modals.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            this.cache['modals'] = html;
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading modals:', error);
        }
    }

    updateActiveState() {
        // 更新侧边栏激活状态
        document.querySelectorAll('[data-page]').forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === this.currentPage) {
                link.classList.remove('text-gray-700', 'hover:bg-gray-100');
                link.classList.add('text-white', 'bg-primary');
            } else {
                link.classList.remove('text-white', 'bg-primary');
                link.classList.add('text-gray-700', 'hover:bg-gray-100');
            }
        });
    }
}

// 初始化页面加载器
let pageLoader;

document.addEventListener('DOMContentLoaded', function() {
    pageLoader = new PageLoader();
    
    // 页面切换事件
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            if (pageName && pageLoader) {
                pageLoader.loadPage(pageName);
            }
        });
    });
});
