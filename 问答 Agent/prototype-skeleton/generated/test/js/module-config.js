window.MODULE_SPEC = {
  "moduleName": "Test",
  "pageId": "test",
  "breadcrumb": "基础信息",
  "pageType": "list-crud",
  "version": "1.0.0",
  "dataFile": "data/test-data.json",
  "filters": [
    {
      "id": "filter0",
      "label": "状态",
      "type": "select",
      "field": "status",
      "match": "exact",
      "options": [
        {
          "value": "",
          "label": "全部"
        },
        {
          "value": "active",
          "label": "启用"
        },
        {
          "value": "inactive",
          "label": "禁用"
        }
      ],
      "defaultValue": "全部"
    },
    {
      "id": "filter1",
      "label": "价卡名称",
      "type": "text",
      "field": "name",
      "match": "contains",
      "placeholder": "请输入"
    }
  ],
  "columns": [
    {
      "field": "name",
      "label": "价卡名称"
    },
    {
      "field": "customer",
      "label": "客户"
    },
    {
      "field": "status",
      "label": "状态",
      "type": "status"
    },
    {
      "field": "createdAt",
      "label": "创建时间",
      "type": "datetime",
      "sortable": true
    }
  ],
  "rowActions": [
    "edit",
    "delete"
  ],
  "toolbarButtons": [
    {
      "id": "toolbarBtn0",
      "label": "新增价卡",
      "icon": "fa-plus",
      "action": "create"
    },
    {
      "id": "toolbarBtn1",
      "label": "导出",
      "icon": "fa-download",
      "action": "custom"
    },
    {
      "id": "toolbarBtn0",
      "label": "批量删除",
      "icon": "fa-plus",
      "action": "create"
    }
  ],
  "formFields": [
    {
      "id": "fieldName",
      "label": "价卡名称",
      "field": "name",
      "required": true,
      "type": "text",
      "placeholder": "请输入价卡名称"
    },
    {
      "id": "fieldCustomer",
      "label": "客户",
      "field": "customer",
      "required": true,
      "type": "text",
      "placeholder": "请输入客户"
    },
    {
      "id": "fieldStatus",
      "label": "状态",
      "field": "status",
      "required": true,
      "type": "select",
      "options": [
        {
          "value": "active",
          "label": "启用"
        },
        {
          "value": "inactive",
          "label": "禁用"
        }
      ]
    }
  ],
  "statusLabels": {
    "active": {
      "label": "启用",
      "class": "badge-success"
    },
    "inactive": {
      "label": "禁用",
      "class": "badge-secondary"
    }
  },
  "mockData": [
    {
      "id": "row_001",
      "name": "示例价卡名称",
      "customer": "示例客户",
      "status": "active",
      "createdAt": "2026-06-27T10:00:00.000Z"
    }
  ],
  "logicDocsHtml": "<div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-play-circle text-primary mr-2\"></i>初始化页面（数据展示逻辑）\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">说明</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">数据来源</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">展示规则</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">列表数据</td><td class=\"px-3 py-2 text-gray-600\">加载 mock 并渲染 data/test-data.json</td><td class=\"px-3 py-2 text-gray-600\">mock 数据</td><td class=\"px-3 py-2 text-gray-600\">默认排序</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-search text-primary mr-2\"></i>检索条件\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">检索项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">输入方式</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">状态</td><td class=\"px-3 py-2 text-gray-600\">下拉单选</td><td class=\"px-3 py-2 text-gray-600\">全部/启用/禁用</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">价卡名称</td><td class=\"px-3 py-2 text-gray-600\">文本输入</td><td class=\"px-3 py-2 text-gray-600\">请输入</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-mouse-pointer text-primary mr-2\"></i>模块按钮逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">按钮</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">位置</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">前置条件</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">后续操作</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">新增价卡</td><td class=\"px-3 py-2 text-gray-600\">工具栏</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">打开新增表单弹窗，提交后刷新列表</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">导出</td><td class=\"px-3 py-2 text-gray-600\">工具栏</td><td class=\"px-3 py-2 text-gray-600\">有检索结果</td><td class=\"px-3 py-2 text-gray-600\">按当前检索条件导出 Excel</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">编辑</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">打开编辑弹窗并回填</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">删除</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">二次确认后删除</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">批量删除</td><td class=\"px-3 py-2 text-gray-600\">工具栏</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">批量删除逻辑</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-list-alt text-primary mr-2\"></i>属性取值逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">字段</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">名称</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">类型</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">必填</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">取值说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">价卡名称</td><td class=\"px-3 py-2 text-gray-600\">文本</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">客户</td><td class=\"px-3 py-2 text-gray-600\">文本</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">状态</td><td class=\"px-3 py-2 text-gray-600\">状态标签</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">创建时间</td><td class=\"px-3 py-2 text-gray-600\">日期时间</td><td class=\"px-3 py-2 text-gray-600\">是</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr></tbody></table></div></div>\n</div>"
};
