# 海外仓报价中心系统 - 报价模块原型生成提示词

## Role
You are a world-class UI/UX engineer and frontend developer, specializing in enterprise web applications using HTML, Tailwind CSS, and vanilla JavaScript.

## Task
Create a high-fidelity web prototype for the quotation module of an overseas warehouse quotation center system. The system is a professional B2B enterprise tool for managing price cards, setting customer discounts, and generating customized quotations.

Design style must strictly follow the **design-system.md specifications**, with core keywords: professional, consistent, clear, usable, responsive.

## Tech Stack Specifications

- **File structure**: Single HTML file with embedded CSS and JavaScript
- **Framework**: Tailwind CSS (via CDN: https://cdn.tailwindcss.com)
- **Icon library**: Font Awesome 4.7.0 (via CDN)
- **Font library**: Inter, system-ui, sans-serif
- **Markdown parsing**: Marked.js (via CDN)
- **Chart rendering**: Mermaid.js (via CDN)
- **Device simulation**: Desktop-first design, responsive for tablet (1024px+)
- **Asset sources**: Real UI images from Unsplash for backgrounds/avatars
- **Custom configuration**: Tailwind config with custom brand colors

## Visual Design Requirements

### (a) Color Palette (Based on design-system.md)

**Brand Colors:**
- Primary (Deep Blue): #2a3b7d - 用于主要按钮、导航激活状态、重要操作
- Secondary (Cyan): #36CFC9 - 用于辅助信息、次要操作
- Accent (Purple): #722ED1 - 用于强调信息、特殊状态
- Success (Green): #00B42A - 用于成功状态、确认信息
- Warning (Orange): #FF7D00 - 用于警告状态
- Error (Red): #F53F3F - 用于错误状态、删除操作

**Background Colors:**
- Main Background: #F9FAFB - 页面主背景
- Section Background: #FFFFFF - 卡片/区域背景
- Card Background: #FFFFFF - 卡片背景

**Text Colors:**
- Title (Primary): #1D2129 - 标题文字
- Body (Secondary): #374151 - 正文文字
- Tertiary: #6B7280 - 次要文本
- Disabled: #D1D5DB - 禁用状态文字

**UI Element Colors:**
- Border: #E5E7EB - 边框颜色
- Divider: #E5E7EB - 分割线颜色
- Hover Background: #F3F4F6 - 悬停背景

### (b) UI Style Characteristics (Based on design-system.md)

**Cards:**
- Background: #FFFFFF
- Border radius: 12px (大圆角)
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Border: 1px solid #E5E7EB
- Padding: 16px

**Buttons:**
- Large (40px): Height 40px, padding 0 24px
- Medium (32px): Height 32px, padding 0 16px
- Small (24px): Height 24px, padding 0 12px
- Primary: Background #2a3b7d, text white, border radius 12px
- Secondary: Background #FFFFFF, border 1px solid #E5E7EB, text #1D2129, border radius 12px
- Warning: Background #FF7D00, text white, border radius 12px
- Danger: Background #F53F3F, text white, border radius 12px
- States: Hover (opacity 0.8), Active (opacity 0.6), Disabled (opacity 0.4, cursor not-allowed)
- Transition: 0.3s ease

**Input Fields:**
- Height: 32px
- Border radius: 12px (中圆角)
- Border: 1px solid #E5E7EB
- Padding: 0 12px
- States: Normal (border #E5E7EB), Focus (border #2a3b7d, outline 2px solid #2a3b7d), Error (border #F53F3F), Success (border #00B42A), Disabled (opacity 0.4)
- Search input: With search icon (FontAwesome fa-search) on the left

**Tables:**
- Row height: 48px
- Header: Background linear-gradient from #2a3b7d to #36CFC9, text white
- Data rows: Alternating background (white and #F9FAFB), hover effect (background #F3F4F6)
- Action column: Fixed on the right, contains edit/delete buttons
- Operations: Inline operation buttons, batch operations
- Hierarchy: Support tree structure expand/collapse

**Modals:**
- Width: Max width 600px
- Height: Max height 80vh
- Animation: Fade in/out, scale animation from center
- Layout: Header, body, and bottom action area

**Navigation Menus:**
- Top navigation: Dark background (#2a3b7d), white text
- Dropdown menus: White background, shadow effect, hover state
- Hierarchy navigation: Support multi-level menus

**Tab Switching:**
- Style: Fixed at bottom-right corner, gradient background
- Interaction: Click to switch, smooth transition effect
- States: Active and inactive states

### (c) Layout Structure (Based on design-system.md)

**Top Navigation Bar (顶部导航栏):**
- Height: 56px
- Background: #2a3b7d (Deep Blue)
- Border bottom: 1px solid #E5E7EB
- Logo/Title: Left aligned, 18px bold, color white
- Menu items: Horizontal layout, 8px gap, white text
- Active state: Text color white, bottom border 2px solid #36CFC9
- User profile: Right aligned, avatar + name + dropdown

**Content Areas (内容区域):**
- Main content: Max width 1280px, centered, 16px top/bottom padding
- Grid: 12-column grid, 12px gap (中观间距)
- Cards: White background, 16px padding, 12px border radius

**Quick Access Areas (快捷访问区):**
- Icon grid: 4-column layout
- Icon size: 48px
- Item height: 80px
- Hover effect: Background #F3F4F6, transform translateY(-2px)

**Data Display Cards (数据展示卡片):**
- Metrics: Large numbers (32px bold), labels (14px gray)
- Layout: Horizontal, icon + metric + trend
- Height: 120px
- Spacing: 16px between cards

**Feature Lists (功能列表):**
- Structure: Icon + title + description + action
- Icon size: 24px
- Title: 16px bold
- Description: 14px gray
- Action: Right arrow icon
- Hover: Background #F3F4F6

**Bottom Tab Bar (底部标签栏):**
- Style: Fixed at bottom-right corner
- Background: Linear gradient from #2a3b7d to #36CFC9
- Tabs: Prototype, PRD, Test Cases
- Height: 48px
- Active state: White background, text #2a3b7d
- Inactive state: Transparent background, text white
- Transition: 0.3s ease

### (d) Specific Page Content (报价模块)

**Price Card Management (价卡管理):**
- Page title: "价卡管理" (24px, 700 weight, color #1D2129)
- Search bar: Placeholder "输入价卡名称", height 32px, with search icon
- Filter dropdowns: 
  - 服务类型 (全部/仓储服务/操作服务/配送服务)
  - 状态 (全部/生效中/已过期)
- Add button: "新增价卡" (primary button, height 40px)
- Table columns: 价卡名称, 服务类型, 生效时间, 过期时间, 状态, 操作
- Sample data: 
  - 标准仓储价卡 (仓储服务, 2024-01-01, 2024-12-31, 生效中)
  - 操作服务价卡 (操作服务, 2024-01-01, 2024-12-31, 生效中)
  - 配送服务价卡 (配送服务, 2024-01-01, 2024-12-31, 生效中)

**Discount Settings (折扣设置):**
- Page title: "折扣设置" (24px, 700 weight, color #1D2129)
- Customer tier cards (3 cards in grid):
  - 普通客户: 折扣率 0%, 适用于新注册客户
  - 银卡客户: 折扣率 5%, 适用于月交易额 ≥ $10,000
  - 金卡客户: 折扣率 10%, 适用于月交易额 ≥ $50,000
- Discount rules table:
  - Columns: 规则名称, 适用客户, 服务类型, 折扣率, 生效时间, 操作
  - Sample data: 
    - 银卡客户折扣 (银卡客户, 全部服务, 5%, 2024-01-01)
    - 金卡客户折扣 (金卡客户, 全部服务, 10%, 2024-01-01)
    - 仓储服务折扣 (所有客户, 仓储服务, 3%, 2024-01-01)

**Quote Generation (报价生成):**
- Page title: "报价生成" (24px, 700 weight, color #1D2129)
- Customer info section:
  - Customer name dropdown: "选择客户"
  - Customer tier: "银卡客户" (disabled, background #F9FAFB)
  - Contact: "输入联系人姓名"
  - Phone: "输入联系电话"
- Service selection section:
  - Storage service: 仓储体积 (100立方米), 仓储天数 (30天), 小计 $14,250.00
  - Operation service: 操作数量 (5000件), 操作类型 (拣货/打包/拣货+打包), 小计 $11,875.00
  - Delivery service: 配送数量 (1000件), 配送区域 (本地/全国/国际), 小计 $14,250.00
- Quote summary section:
  - Total breakdown: 仓储服务 $14,250.00, 操作服务 $11,875.00, 配送服务 $14,250.00
  - Grand total: $40,375.00 (32px bold, color #2a3b7d)
  - Quote info: 报价编号 (QT-2024-0001), 报价有效期 (2024-02-15), 备注
- Action buttons: 
  - "保存草稿" (secondary button, height 40px)
  - "生成报价" (primary button, height 40px, background #FF7D00)

## Implementation Details

- **Page width**: Max width 1280px, centered with auto margins
- **Layout systems**: Flexbox for navigation and cards, Grid for dashboard metrics
- **Fixed/sticky positioning**: Top navigation bar sticky at top, tab bar fixed at bottom-right
- **Spacing scale**: 
  - Macro spacing: 16px (页面边距)
  - Meso spacing: 12px (区域间距)
  - Micro spacing: 8px (元素间距)
  - Compact spacing: 4px (文本与图标间距)
- **Typography**:
  - Font family: Inter, system-ui, sans-serif
  - Page title: 24px, 700 weight, line height 1.2
  - Card title: 18px, 600 weight, line height 1.2
  - Section title: 16px, 600 weight, line height 1.2
  - Body text: 14px, 400 weight, line height 1.5
  - Helper text: 12px, 400 weight, line height 1.4
- **Interactive states**:
  - Hover: Background #F3F4F6, opacity 0.8
  - Active: Background #E5E7EB, opacity 0.6
  - Focus: Outline 2px solid #2a3b7d, outline-offset 2px
  - Disabled: Opacity 0.4, cursor not-allowed
  - Transition: 0.3s ease
- **Icon sources**: Font Awesome 4.7.0 via CDN
- **Border and divider styling**: 1px solid #E5E7EB, color #E5E7EB

## Tailwind Configuration

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2a3b7d',
        'brand-secondary': '#36CFC9',
        'brand-accent': '#722ED1',
        'brand-success': '#00B42A',
        'brand-warning': '#FF7D00',
        'brand-error': '#F53F3F',
        'bg-main': '#F9FAFB',
        'bg-card': '#FFFFFF',
        'text-primary': '#1D2129',
        'text-secondary': '#374151',
        'text-tertiary': '#6B7280',
        'border-default': '#E5E7EB',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Monaco', 'Menlo', 'monospace'],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      borderRadius: {
        'large': '16px',
        'medium': '12px',
        'small': '8px',
        'mini': '4px',
      }
    }
  }
}
```

## Content Structure & Hierarchy

```
海外仓报价中心系统 - 报价模块
├─ 顶部导航栏
│  ├─ Logo/系统名称
│  ├─ 导航菜单 (仪表盘/价卡管理/折扣设置/报价生成/报表分析)
│  └─ 用户信息
├─ 主内容区域
│  ├─ 价卡管理页面
│  │  ├─ 搜索和筛选栏
│  │  │  ├─ 搜索输入框
│  │  │  ├─ 服务类型下拉选择
│  │  │  └─ �状态下拉选择
│  │  ├─ 新增价卡按钮
│  │  └─ 价卡列表表格
│  │     ├─ 表头 (价卡名称/服务类型/生效时间/过期时间/状态/操作)
│  │     └─ 数据行 (标准仓储价卡/操作服务价卡/配送服务价卡)
│  ├─ 折扣设置页面
│  │  ├─ 客户等级卡片区域
│  │  │  ├─ 普通客户卡片
│  │  │  ├─ 银卡客户卡片
│  │  │  └─ 金卡客户卡片
│  │  ├─ 新增折扣规则按钮
│  │  └─ 折扣规则表格
│  │     ├─ 表头 (规则名称/适用客户/服务类型/折扣率/生效时间/操作)
│  │     └─ 数据行 (银卡客户折扣/金卡客户折扣/仓储服务折扣)
│  └─ 报价生成页面
│     ├─ 客户信息表单
│     │  ├─ 客户名称下拉选择
│     │  ├─ 客户等级显示
│     │  ├─ 联系人输入框
│     │  └─ 联系电话输入框
│     ├─ 服务选择表单
│     │  ├─ 仓储服务卡片
│     │  │  ├─ 仓储体积输入
│     │  │  ├─ 仓储天数输入
│     │  │  └─ 小计显示
│     │  ├─ 操作服务卡片
│     │  │  ├─ 操作数量输入
│     │  │  ├─ 操作类型选择
│     │  │  └─ 小计显示
│     │  └─ 配送服务卡片
│     │     ├─ 配送数量输入
│     │     ├─ 配送区域选择
│     │     └─ 小计显示
│     ├─ 报价汇总卡片
│     │  ├─ 费用明细
│     │  │  ├─ 仓储服务费用
│     │  │  ├─ 操作服务费用
│     │  │  ├─ 配送服务费用
│     │  │  └─ 总计
│     │  ├─ 报价信息
│     │  │  ├─ 报价编号
│     │  │  ├─ 报价有效期
│     │  │  └─ 备注
│     │  └─ 操作按钮
│     │     ├─ 保存草稿按钮
│     │     └─ 生成报价按钮
└─ 底部标签栏
   ├─ 原型标签
   ├─ PRD标签
   └─ 测试用例标签
```

## Special Requirements

- **Design system**: Strictly follow design-system.md specifications
- **Primary color application**: #2a3b7d for primary actions, navigation active states, and important highlights
- **Secondary color application**: #36CFC9 for auxiliary information, secondary actions
- **Interaction details**: 
  - Hover effects on all interactive elements (background change, opacity adjustment)
  - Active states with visual feedback (border, background)
  - Smooth transitions (0.3s ease)
  - Focus states for accessibility (2px outline)
  - Modal animations: Fade in/out, scale from center
  - Tab switching animations: Smooth transition effect
  - Table row expand/collapse animations: Smooth height change
- **Feedback mechanisms**:
  - Success feedback: Green (#00B42A) notification, success icon
  - Error feedback: Red (#F53F3F) notification, error icon
  - Warning feedback: Orange (#FF7D00) notification, warning icon
  - Info feedback: Blue (#2a3b7d) notification, info icon
  - Loading state: Loading animation and hint text
  - Operation feedback: Button click feedback, status change
- **Keyboard navigation**:
  - All interactive elements should support keyboard navigation
  - Forms should support Tab key switching
  - Should support Enter key to submit forms
- **Accessibility requirements**:
  - Touch targets minimum 44px × 44px
  - Color contrast ratio minimum 4.5:1 for text
  - ARIA labels for screen readers
- **Performance considerations**:
  - Lazy load images below fold
  - Optimize icon delivery (CDN)
  - Minimize CSS/JS file size

## Output Format

Please output complete HTML code with embedded CSS and JavaScript, ensuring:
1. Single HTML file structure
2. Tailwind CSS via CDN
3. Font Awesome icons via CDN
4. Marked.js for Markdown parsing
5. Mermaid.js for chart rendering
6. Custom Tailwind configuration (based on design-system.md)
7. Responsive design (desktop-first, tablet compatible)
8. All pages implemented (price cards, discounts, quote generation)
9. Navigation between pages using JavaScript
10. Tab switching functionality (Prototype, PRD, Test Cases)
11. All content in Chinese
12. Production-ready quality with proper spacing, colors, and typography
13. Modal functionality for add/edit operations
14. Table interactions (expand/collapse, inline operations)
15. Loading states and error handling

The output should be production-ready and viewable at 1280px+ viewport on desktop browsers.