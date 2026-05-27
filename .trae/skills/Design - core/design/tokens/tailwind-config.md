# Tailwind 完整配置

可直接复制到项目中使用的完整配置对象。各令牌详细说明见子文件。

```javascript
const DESIGN_TOKENS = {
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#2a3b7d', light: '#3a4ca7', dark: '#1e2d5f' },
                secondary: { DEFAULT: '#36CFC9', light: '#5ED9D4', dark: '#2AB5AF' },
                accent: { DEFAULT: '#722ED1', light: '#8F4DE8', dark: '#5A1FB0' },
                success: { DEFAULT: '#00B42A', light: '#33D161', dark: '#008F22', bg: '#E8FFEC', text: '#006B19' },
                warning: { DEFAULT: '#FF7D00', light: '#FF9933', dark: '#CC6400', bg: '#FFF7E8', text: '#994D00' },
                danger: { DEFAULT: '#F53F3F', light: '#F97070', dark: '#C33232', bg: '#FFECE8', text: '#B3261E' },
                info: { DEFAULT: '#1677FF', light: '#4096FF', dark: '#0E5FCC', bg: '#E8F3FF', text: '#094D8C' },
                neutral: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' },
                dark: '#1D2129', border: '#E5E7EB', 'light-bg': '#FFFFFF', 'card-bg': '#FFFFFF'
            },
            fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'] },
            fontSize: { xs: ['0.75rem', { lineHeight: '1rem' }], sm: ['0.875rem', { lineHeight: '1.25rem' }], base: ['0.95rem', { lineHeight: '1.5rem' }], lg: ['1rem', { lineHeight: '1.5rem' }], xl: ['1.125rem', { lineHeight: '1.75rem' }], '2xl': ['1.25rem', { lineHeight: '1.75rem' }], '3xl': ['1.4rem', { lineHeight: '2rem' }], '4xl': ['1.875rem', { lineHeight: '2.25rem' }], '5xl': ['2rem', { lineHeight: '2.25rem' }] },
            spacing: { 0: '0', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem' },
            borderRadius: { none: '0', sm: '0.125rem', DEFAULT: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
            boxShadow: { sm: '0 1px 2px rgba(0,0,0,0.05)', DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)', card: '0 2px 8px rgba(0,0,0,0.05)', 'card-hover': '0 10px 25px -5px rgba(42,59,125,0.1)', dropdown: '0 4px 16px rgba(0,0,0,0.1)', modal: '0 20px 60px -15px rgba(0,0,0,0.15)', button: '0 2px 4px rgba(0,0,0,0.08)' },
            screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
            zIndex: { 0: '0', 10: '10', 20: '20', 30: '30', 40: '40', 50: '50', 60: '60' }
        }
    }
};
```
