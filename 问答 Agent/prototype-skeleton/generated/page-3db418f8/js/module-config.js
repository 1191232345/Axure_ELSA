window.MODULE_SPEC = {
  "moduleName": "价卡查询",
  "pageId": "page-3db418f8",
  "breadcrumb": "<业务域/面包屑或null>",
  "pageType": "list-crud",
  "version": "1.0.0",
  "dataFile": "data/page-3db418f8-data.json",
  "filters": [],
  "columns": [
    {
      "field": "field1",
      "label": "需求"
    },
    {
      "field": "field2",
      "label": "功能点"
    }
  ],
  "rowActions": [
    "edit",
    "delete"
  ],
  "toolbarButtons": [
    {
      "id": "addBtn",
      "label": "新增价卡查询",
      "icon": "fa-plus",
      "action": "create"
    }
  ],
  "formFields": [
    {
      "id": "fieldField1",
      "label": "需求",
      "field": "field1",
      "required": true,
      "type": "text",
      "placeholder": "请输入需求"
    },
    {
      "id": "fieldField2",
      "label": "功能点",
      "field": "field2",
      "required": true,
      "type": "text",
      "placeholder": "请输入功能点"
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
      "field1": "示例需求",
      "field2": "示例功能点"
    }
  ],
  "logicDocsHtml": "<div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-play-circle text-primary mr-2\"></i>初始化页面（数据展示逻辑）\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">说明</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">数据来源</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">展示规则</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">列表数据</td><td class=\"px-3 py-2 text-gray-600\">加载 mock 并渲染</td><td class=\"px-3 py-2 text-gray-600\">data/page-3db418f8-data.json</td><td class=\"px-3 py-2 text-gray-600\">默认排序</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-search text-primary mr-2\"></i>检索条件\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">检索项</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">输入方式</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">逻辑说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">-</td><td class=\"px-3 py-2 text-gray-600\">展示全部</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-mouse-pointer text-primary mr-2\"></i>模块按钮逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">按钮</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">位置</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">前置条件</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">后续操作</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">新增价卡查询</td><td class=\"px-3 py-2 text-gray-600\">工具栏</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">打开表单弹窗</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">编辑</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">无</td><td class=\"px-3 py-2 text-gray-600\">回填并编辑</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">删除</td><td class=\"px-3 py-2 text-gray-600\">行操作</td><td class=\"px-3 py-2 text-gray-600\">confirm</td><td class=\"px-3 py-2 text-gray-600\">从列表移除</td></tr></tbody></table></div></div>\n</div><div class=\"mb-4 border border-gray-200 rounded-lg overflow-hidden\">\n  <div class=\"px-4 py-3 bg-gray-50 border-b border-gray-200\">\n    <h4 class=\"font-semibold text-gray-800 flex items-center\">\n      <i class=\"fas fa-list-alt text-primary mr-2\"></i>属性取值逻辑\n    </h4>\n  </div>\n  <div class=\"p-4\"><div class=\"overflow-x-auto\"><table class=\"min-w-full text-sm border border-gray-200 rounded\"><thead class=\"bg-gray-50\"><tr><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">字段</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">名称</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">类型</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">必填</th><th class=\"px-3 py-2 text-left font-medium text-gray-700 border-b\">取值说明</th></tr></thead><tbody><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">field1</td><td class=\"px-3 py-2 text-gray-600\">需求</td><td class=\"px-3 py-2 text-gray-600\">text</td><td class=\"px-3 py-2 text-gray-600\">是</td><td class=\"px-3 py-2 text-gray-600\">手工输入</td></tr><tr class=\"hover:bg-gray-50\"><td class=\"px-3 py-2 text-gray-600\">field2</td><td class=\"px-3 py-2 text-gray-600\">功能点</td><td class=\"px-3 py-2 text-gray-600\">text</td><td class=\"px-3 py-2 text-gray-600\">是</td><td class=\"px-3 py-2 text-gray-600\">手工输入</td></tr></tbody></table></div></div>\n</div>"
};
