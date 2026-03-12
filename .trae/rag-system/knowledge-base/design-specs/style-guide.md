# 风格指南

## 设计风格概述

### 设计理念
- **现代简约**: 采用现代简约的设计风格，注重用户体验
- **响应式设计**: 支持移动端、平板和桌面端
- **一致性**: 统一的设计语言和组件风格
- **易用性**: 操作流程简单直观，交互反馈清晰

### 技术栈
- **CSS框架**: Tailwind CSS
- **图标库**: Font Awesome 4.7.0
- **字体**: Inter, system-ui, sans-serif
- **动画**: CSS3 transitions 和 animations

## 色彩系统

### 主色调
```css
primary: #2a3b7d
primary-light: #3a4ca7
```

### 辅助色
```css
success: #00B42A
warning: #FF7D00
danger: #F53F3F
info: #1890FF
```

### 中性色
```css
dark: #1D2129
neutral-800: #374151
neutral-700: #4B5563
neutral-600: #6B7280
gray-500: #9CA3AF
gray-400: #D1D5DB
border: #E5E7EB
light-bg: #F9FAFB
```

### 渐变色
```css
主色渐变: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%)
次级渐变: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)
表格表头渐变: linear-gradient(135deg, #2a3b7d 0%, #4f46e5 100%)
```

## 排版系统

### 字体家族
```css
font-family: Inter, system-ui, sans-serif;
```

### 字号规范
```css
H1: 2rem (32px)
H2: 1.4rem (22.4px)
H3: 1.15rem (18.4px)
H4: 1rem (16px)
正文: 0.95rem (15.2px)
小文本: 0.875rem (14px)
超小文本: 0.75rem (12px)
```

### 行高规范
```css
H1: 2.5rem (40px)
H2: 2.8rem (44.8px)
H3: 2.4rem (38.4px)
正文: 1.8
```

## 间距系统

### 基础间距
```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### 组件间距
```css
卡片内边距: 1rem (16px)
表单元素间距: 1rem (16px)
按钮间距: 0.5rem (8px)
表格单元格内边距: 0.75rem 1rem (12px 16px)
模态框内边距: 1.25rem (20px)
```

## 圆角规范

### 组件圆角
```css
小圆角: 4px (按钮、输入框、表单元素)
中圆角: 6px (下拉选择框)
大圆角: 8px (卡片、模态框)
超大圆角: 12px (特殊卡片、徽章)
圆形: 9999px (徽章、按钮)
```

## 阴影系统

### 阴影规范
```css
卡片阴影: 0 2px 8px rgba(0, 0, 0, 0.05)
卡片悬停阴影: 0 10px 25px -5px rgba(42, 59, 125, 0.1)
下拉菜单阴影: 0 4px 16px rgba(0, 0, 0, 0.1)
头部阴影: 0 2px 4px rgba(0, 0, 0, 0.05)
模态框阴影: 0 4px 20px rgba(0, 0, 0, 0.15)
```

## 组件样式

### 按钮

#### 主按钮
```css
background-color: #2a3b7d
color: white
padding: 6px 12px
border-radius: 4px
font-size: 14px
transition: all 0.2s ease
hover: background-color #3a4ca7, transform translateY(-1px)
active: transform translateY(0)
```

#### 次要按钮
```css
background-color: white
color: #525252
border: 1px solid #d4d4d4
padding: 6px 12px
border-radius: 4px
font-size: 14px
transition: all 0.2s ease
hover: border-color #a3a3a3, color #262626
```

#### 表格按钮
```css
padding: 0.25rem 0.5rem
font-size: 0.75rem
border-radius: 4px
transition: all 0.2s ease
border: none
cursor: pointer
hover: transform translateY(-1px), box-shadow 0 2px 4px rgba(0, 0, 0, 0.1)
```

### 表单元素

#### 输入框
```css
width: 100%
padding: 8px 12px
border: 1px solid #E5E7EB
border-radius: 6px
font-size: 14px
color: #1D2129
background-color: white
transition: all 0.2s ease
focus: outline none, border-color #2a3b7d, box-shadow 0 0 0 2px rgba(42, 59, 125, 0.1)
```

#### 下拉选择框
```css
width: 100%
padding: 8px 12px
border: 1px solid #E5E7EB
border-radius: 6px
font-size: 14px
color: #1D2129
background-color: white
transition: all 0.2s ease
appearance: none
focus: outline none, border-color #2a3b7d, box-shadow 0 0 0 2px rgba(42, 59, 125, 0.1)
```

### 表格

#### 基本表格
```css
width: 100%
border-collapse: separate
border-spacing: 0
font-size: 0.875rem (14px)
```

#### 表头
```css
background: linear-gradient(135deg, #2a3b7d 0%, #4f46e5 100%)
color: white
font-weight: 600
text-align: left
padding: 0.75rem 1rem (12px 16px)
border: none
white-space: nowrap
```

#### 表格单元格
```css
padding: 0.75rem 1rem (12px 16px)
border: none
border-bottom: 1px solid #e5e7eb
background: white
```

#### 表格行
```css
transition: background-color 0.2s ease
hover: background-color #f9fafb
```

### 模态框

#### 模态框遮罩
```css
position: fixed
top: 0
left: 0
right: 0
bottom: 0
background-color: rgba(0, 0, 0, 0.5)
display: flex
align-items: center
justify-content: center
z-index: 50
opacity: 0
visibility: hidden
transition: opacity 0.3s ease, visibility 0.3s ease
show: opacity 1, visibility visible
```

#### 模态框内容
```css
background-color: white
border-radius: 8px
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)
width: 90%
max-width: 600px
max-height: 80vh
overflow-y: auto
transform: translateY(-20px)
transition: transform 0.3s ease
show: transform translateY(0)
```

#### 模态框头部
```css
padding: 20px
border-bottom: 1px solid #E5E7EB
display: flex
justify-content: space-between
align-items: center
```

#### 模态框主体
```css
padding: 20px
```

#### 模态框底部
```css
padding: 16px 20px
border-top: 1px solid #E5E7EB
display: flex
justify-content: flex-end
gap: 12px
```

### 徽章

#### 状态徽章
```css
padding: 0.25rem 0.5rem (4px 8px)
font-size: 0.75rem (12px)
border-radius: 9999px
display: inline-flex
align-items: center
justify-content: center
font-weight: 500
```

#### 徽章颜色
```css
主仓: bg-purple-100 text-purple-800
渠道仓: bg-blue-100 text-blue-800
备货仓: bg-teal-100 text-teal-800
待处理: bg-orange-100 text-orange-800
已审批: bg-blue-100 text-blue-800
已完成: bg-green-100 text-green-800
已拒绝: bg-red-100 text-red-800
```

## 动画效果

### 过渡动画
```css
标准过渡: transition: all 0.2s ease
平滑过渡: transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### 按钮动画
```css
hover: opacity 0.9, transform translateY(-1px), box-shadow 0 2px 4px rgba(0, 0, 0, 0.1)
active: transform translateY(0)
```

### 模态框动画
```css
进入: animation: modalZoomIn 0.3s ease-out
@keyframes modalZoomIn {
  from { opacity: 0, transform: scale(0.8) }
  to { opacity: 1, transform: scale(1) }
}
```

### 缩放淡入动画
```css
animation: scaleFadeIn 0.3s ease-out forwards
@keyframes scaleFadeIn {
  0% { opacity: 0, transform: scale(0.95) }
  100% { opacity: 1, transform: scale(1) }
}
```

## 布局系统

### 页面布局
```css
容器: max-width: 1200px, margin: 0 auto
页面内边距: padding: 0.5rem 1rem (8px 16px)
```

### 卡片布局
```css
卡片圆角: 8px
卡片阴影: 0 2px 8px rgba(0, 0, 0, 0.05)
卡片内边距: 1rem (16px)
卡片间距: margin-bottom: 1rem (16px)
```

### 网格系统
```css
基础网格: 12列
网格间距: gap: 1rem (16px)
```

### 响应式断点
```css
移动端: < 768px
平板: 768px - 1024px
桌面: > 1024px
```

## 交互模式

### 搜索和筛选
- 顶部搜索框，支持文本输入
- 下拉筛选框，支持多维度筛选
- 重置按钮，清空所有筛选条件
- 搜索按钮，执行搜索操作

### 数据展示
- 表格形式展示数据
- 支持分页
- 支持排序
- 支持悬停高亮

### 操作按钮
- 新增按钮：打开新增模态框
- 编辑按钮：打开编辑模态框，填充当前数据
- 删除按钮：显示确认弹窗
- 查看按钮：打开详情模态框

### 逻辑说明
- 可展开/收起的逻辑说明区域
- 表格形式展示逻辑规则
- 分类展示：初始化页面、检索条件、按钮逻辑、属性取值逻辑

## 图标使用

### Font Awesome 图标
```html
<i class="fa fa-search"></i> 搜索
<i class="fa fa-plus"></i> 新增
<i class="fa fa-edit"></i> 编辑
<i class="fa fa-trash"></i> 删除
<i class="fa fa-refresh"></i> 重置
<i class="fa fa-download"></i> 导出
<i class="fa fa-chevron-down"></i> 展开
<i class="fa-chevron-right"></i> 收起
<i class="fa fa-times"></i> 关闭
<i class="fa fa-bell-o"></i> 通知
<i class="fa fa-book"></i> 逻辑说明
<i class="fa fa-database"></i> 数据
<i class="fa fa-mouse-pointer"></i> 按钮
<i class="fa fa-list-alt"></i> 属性
```

## 最佳实践

### 代码组织
- 使用语义化的HTML标签
- 使用BEM命名规范
- 保持代码简洁易读
- 添加必要的注释

### 性能优化
- 使用CSS动画代替JavaScript动画
- 使用transform和opacity进行动画
- 避免使用box-shadow进行动画
- 使用will-change属性优化动画性能

### 可访问性
- 使用适当的HTML标签
- 添加ARIA属性
- 支持键盘导航
- 确保颜色对比度符合标准

### 响应式设计
- 使用相对单位（rem, em, %）
- 使用媒体查询适配不同设备
- 确保在移动端有良好的用户体验
- 使用flexbox和grid布局

## 适用场景

### 业务系统
- 虚拟仓管理系统
- 订单管理系统
- 库存管理系统
- 客户管理系统

### 管理后台
- 企业管理后台
- 运营管理后台
- 数据分析后台
- 内容管理后台

### 其他系统
- 任何需要统一设计语言的系统
- 任何需要快速开发的系统
- 任何需要良好用户体验的系统