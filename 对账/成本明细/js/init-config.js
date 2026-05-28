const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A365D', light: '#2C5282', dark: '#0F2942' },
        secondary: { DEFAULT: '#2D3748', light: '#4A5568', dark: '#1A202C' },
        accent: { DEFAULT: '#38A169', light: '#48BB78', dark: '#2F855A' },
        success: { DEFAULT: '#38A169', light: '#48BB78', dark: '#2F855A', bg: '#F0FFF4', text: '#22543D' },
        warning: { DEFAULT: '#D69E2E', light: '#ECC94B', dark: '#B7791F', bg: '#FFFFF0', text: '#744210' },
        danger: { DEFAULT: '#E53E3E', light: '#FC8181', dark: '#C53030', bg: '#FFF5F5', text: '#742A2A' },
        info: { DEFAULT: '#3182CE', light: '#63B3ED', dark: '#2B6CB0', bg: '#EBF8FF', text: '#2C5282' },
        neutral: { 50: '#F7FAFC', 100: '#EDF2F7', 200: '#E2E8F0', 300: '#CBD5E0', 400: '#A0AEC0', 500: '#718096', 600: '#4A5568', 700: '#2D3748', 800: '#1A202C', 900: '#171923' },
        dark: '#1A202C',
        border: '#E2E8F0',
        'light-bg': '#F7FAFC',
        'card-bg': '#FFFFFF'
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'header': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'modal': '0 10px 25px rgba(0, 0, 0, 0.2)'
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Source Sans Pro', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }
  }
};

const DATA_CONFIG = {
  pageId: 'cost-detail',
  dataFile: 'data/cost-detail-data.json',
  version: '1.0.0'
};

function initTailwind() {
  if (typeof tailwind !== 'undefined') {
    tailwind.config = tailwindConfig;
  }
}

function initMarkedRenderer() {
  if (typeof marked === 'undefined') return;
  
  const renderer = new marked.Renderer();
  renderer.code = function(code, language) {
    if (language === 'mermaid') {
      return '<div class="mermaid-container" onclick="openMermaidModal(this)"><div class="mermaid">' + code + '</div><span class="mermaid-hint"><i class="fas fa-search-plus mr-1"></i>点击放大</span></div>';
    }
    return '<pre><code class="language-' + language + '">' + code + '</code></pre>';
  };
  marked.setOptions({ renderer: renderer, breaks: true, gfm: true });
}

function initMermaid() {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      logLevel: 3
    });
  }
}

function initAll() {
  initTailwind();
  initMarkedRenderer();
  initMermaid();
}

if (typeof window !== 'undefined') {
  window.initAll = initAll;
}

export { tailwindConfig, DATA_CONFIG, initTailwind, initMarkedRenderer, initMermaid, initAll };