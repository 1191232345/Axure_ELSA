# 列表页面模板

## 模板信息
- **名称**: 列表页面模板
- **类型**: 页面模板
- **适用场景**: 数据列表展示、管理界面、搜索结果等
- **版本**: 1.0

## 页面结构

### 顶部区域
- 页面标题
- 面包屑导航
- 主要操作按钮（如新增、批量操作）

### 搜索筛选区域
- 搜索输入框
- 筛选条件（下拉选择、日期选择等）
- 搜索按钮
- 重置按钮

### 数据表格区域
- 表格头部（列标题）
- 数据行（支持分页）
- 操作列（编辑、删除、查看等）
- 表格底部（分页控件、数据统计）

## 设计规范

### 布局规范
- 页面边距: 16px
- 区域间距: 16px
- 表格行高: 48px
- 按钮间距: 8px

### 色彩规范
- 页面背景: #F9FAFB
- 卡片背景: #FFFFFF
- 表格头部: #F3F4F6
- 表格行: 交替背景色
- 操作按钮: 主按钮样式

### 字体规范
- 页面标题: 18px, 600 权重
- 表格标题: 14px, 600 权重
- 表格内容: 14px, 400 权重
- 操作按钮: 14px, 500 权重

## 代码实现

### HTML 结构
```html
<div class="container mx-auto px-2 py-6">
  <!-- 顶部区域 -->
  <div class="bg-white rounded shadow-card p-4 mb-4">
    <h1 class="text-lg font-semibold text-neutral-800">数据列表</h1>
    <div class="text-sm text-neutral-500 mt-1">
      <a href="#" class="hover:text-primary">首页</a> &gt; 
      <span>数据管理</span> &gt; 
      <span class="text-primary">数据列表</span>
    </div>
  </div>

  <!-- 搜索筛选区域 -->
  <div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div class="flex items-center w-full sm:w-auto">
        <label class="text-xs text-neutral-600 mr-2">关键词</label>
        <div class="relative flex-1 sm:w-64">
          <input type="text" placeholder="请输入关键词..." class="w-full pl-7 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <button class="erp-btn erp-btn-secondary flex items-center justify-center flex-1 sm:flex-none">
          <i class="fa fa-refresh mr-1.5"></i> 重置
        </button>
        <button class="erp-btn erp-btn-primary flex items-center justify-center flex-1 sm:flex-none">
          <i class="fa fa-search mr-1.5"></i> 搜索
        </button>
      </div>
    </div>
  </div>

  <!-- 操作按钮区域 -->
  <div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex justify-start gap-3">
      <button class="erp-btn erp-btn-primary">
        <i class="fa fa-plus mr-1.5"></i> 新建
      </button>
      <button class="erp-btn erp-btn-secondary">
        <i class="fa fa-download mr-1.5"></i> 导出
      </button>
    </div>
  </div>

  <!-- 数据表格区域 -->
  <div class="bg-white rounded shadow-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-neutral-200 text-sm table-auto">
        <thead class="bg-primary/10">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">
              <input type="checkbox" class="checkbox-primary">
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">ID</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">创建时间</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-primary whitespace-nowrap sticky right-0 bg-primary/10 z-20">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-neutral-100">
          <!-- 数据行 -->
          <tr class="table-hover-row transition-colors duration-150 hover:bg-neutral-50">
            <td class="px-4 py-3 whitespace-nowrap">
              <input type="checkbox" class="checkbox-primary">
            </td>
            <td class="px-4 py-3 text-neutral-700 whitespace-nowrap">1</td>
            <td class="px-4 py-3 text-neutral-700 whitespace-nowrap">示例数据</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="status-badge bg-green-100 text-green-800">正常</span>
            </td>
            <td class="px-4 py-3 text-neutral-700 whitespace-nowrap">2026-02-01 14:00:00</td>
            <td class="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white z-10">
              <button class="table-btn text-primary hover:bg-primary/10 mr-2">查看</button>
              <button class="table-btn text-primary hover:bg-primary/10 mr-2">编辑</button>
              <button class="table-btn text-danger hover:bg-danger/10">删除</button>
            </td>
          </tr>
          <!-- 更多数据行 -->
        </tbody>
      </table>
    </div>
    
    <!-- 分页区域 -->
    <div class="px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
          上一页
        </a>
        <a href="#" class="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
          下一页
        </a>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-neutral-700">
            显示第 <span class="font-medium">1</span> 到 <span class="font-medium">10</span> 条，共 <span class="font-medium">100</span> 条记录
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
              <span class="sr-only">上一页</span>
              <i class="fa fa-chevron-left"></i>
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-primary text-sm font-medium text-white hover:bg-primary-light">
              1
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              2
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              3
            </a>
            <span class="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">
              ...
            </span>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              10
            </a>
            <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
              <span class="sr-only">下一页</span>
              <i class="fa fa-chevron-right"></i>
            </a>
          </nav>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 最佳实践
- 表格应支持排序和筛选功能
- 长列表必须分页，默认每页10条
- 操作按钮应保持一致性，使用相同的样式
- 状态显示应使用彩色标签，提高可读性
- 批量操作应提供全选功能
- 表格列宽应根据内容自适应
- 移动端应优化表格显示，可能需要横向滚动