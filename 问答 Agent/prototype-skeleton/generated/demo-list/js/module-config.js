window.MODULE_SPEC = {
  "moduleName": "价卡查询示例",
  "pageId": "demo-list",
  "breadcrumb": "费用管理",
  "pageType": "list-crud",
  "version": "1.0.0",
  "dataFile": "data/demo-list-data.json",
  "filters": [
    {
      "id": "filterStatus",
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
      ]
    },
    {
      "id": "filterKeyword",
      "label": "价卡名称",
      "type": "text",
      "field": "name",
      "match": "contains",
      "placeholder": "输入关键字"
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
      "type": "datetime"
    }
  ],
  "rowActions": [
    "edit",
    "delete"
  ],
  "toolbarButtons": [
    {
      "id": "addBtn",
      "label": "新增价卡",
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
      "id": "pc_001",
      "name": "美国仓标准价卡",
      "customer": "示例客户 A",
      "status": "active",
      "createdAt": "2026-06-01T10:00:00.000Z"
    },
    {
      "id": "pc_002",
      "name": "欧洲仓经济价卡",
      "customer": "示例客户 B",
      "status": "inactive",
      "createdAt": "2026-06-15T14:30:00.000Z"
    }
  ],
  "changelog": {
    "version": "1.0.0",
    "storageKey": "demo_list_changelog_v1",
    "autoShow": true,
    "entries": [
      {
        "version": "v1.0.0",
        "date": "2026-06-27",
        "title": "骨架库首次发布",
        "icon": "fa-rocket",
        "color": "text-blue-600",
        "changes": [
          {
            "item": "逻辑说明",
            "desc": "展示方式",
            "before": "页面内嵌展开",
            "after": "弹窗展示，对齐规则配置原版"
          },
          {
            "item": "变更公告",
            "desc": "版本更新提醒",
            "before": "无",
            "after": "支持弹窗 + 首次自动弹出 + 不再提醒"
          },
          {
            "item": "预览方式",
            "desc": "本地打开",
            "before": "依赖静态服务",
            "after": "支持 file:// 直接预览"
          }
        ]
      }
    ]
  },
  "logicDocsHtml": "<div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-play-circle text-primary mr-2\"></i>初始化页面（数据展示逻辑）\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">说明</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">数据来源</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">展示规则</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">列表数据</td><td class=\"px-3 py-2 text-gray-600\">加载 mock 数据并渲染表格</td><td class=\"px-3 py-2 text-gray-600\">data/demo-list-data.json</td><td class=\"px-3 py-2 text-gray-600\">按 createdAt 展示</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-search text-primary mr-2\"></i>检索条件\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">检索项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">输入方式</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">状态</td><td class=\"px-3 py-2 text-gray-600\">下拉单选</td><td class=\"px-3 py-2 text-gray-600\">全部/启用/禁用</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">价卡名称</td><td class=\"px-3 py-2 text-gray-600\">文本输入</td><td class=\"px-3 py-2 text-gray-600\">输入关键字</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-mouse-pointer text-primary mr-2\"></i>模块按钮逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">按钮</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">位置</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">前置条件</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">后续操作</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">新增价卡</td><td class=\"px-3 py-2 text-gray-600\">工具栏</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">打开表单弹窗</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">编辑</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">打开表单并回填</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">删除</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">confirm</td><td class=\"px-3 py-2 text-gray-600\">从列表移除</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-list-alt text-primary mr-2\"></i>属性取值逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">字段</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">名称</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">类型</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">必填</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">取值说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">价卡名称</td><td class=\"px-3 py-2 text-gray-600\">文本</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">客户</td><td class=\"px-3 py-2 text-gray-600\">文本</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">状态</td><td class=\"px-3 py-2 text-gray-600\">状态标签</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">创建时间</td><td class=\"px-3 py-2 text-gray-600\">日期时间</td><td class=\"px-3 py-2 text-gray-600\">否</td><td class=\"px-3 py-2 text-gray-600\">—</td></tr></tbody></table></div></div>\n</div>"
};
