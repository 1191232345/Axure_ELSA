# Prototype Skeleton（方案 C）

原型骨架库：**template 结构 + 规则配置视觉样式**。位于「问答 Agent」项目内，通过 `module.spec.json` 填槽后生成模块；也可独立用 `tools/generate.py` 离线生成。

**支持 `file://` 直接预览**：Mock 数据、逻辑说明均内嵌到 `js/module-config.js`，无需静态服务器。

## 目录

```
prototype-skeleton/
├── css/              # 共享样式（单文件 ≤300 行）
├── js/               # 配置驱动的列表 CRUD 运行时
├── schema/           # module.spec.json 结构说明
├── templates/        # index.html 生成模板
├── tools/generate.py # 从 spec 生成模块目录
├── examples/         # 示例 spec
└── generated/        # 生成输出（默认）
```

## 快速开始

```bash
# 在「问答 Agent」项目根目录下
cd prototype-skeleton
python3 tools/generate.py examples/demo-list.spec.json
```

终端会输出 `file://.../index.html`，**双击 `index.html` 或在浏览器中打开该路径即可预览**。

也可输出到业务目录：

```bash
python3 tools/generate.py examples/demo-list.spec.json -o ../费用管理/我的新模块
```

> CDN（Tailwind / Font Awesome）仍需联网加载；离线环境可后续改为本地 vendor。

## 生成物 vs 骨架

| 类型 | 位置 | 说明 |
|------|------|------|
| 骨架（只读） | `prototype-skeleton/css\|js/` | 所有新模块引用 |
| 每模块生成 | `module.spec.json` | 对话收集的槽位（源） |
| 每模块生成 | `js/module-config.js` | 运行时配置 + **内嵌 mock/文档** |
| 每模块生成 | `data/*.json` | Mock 数据副本（http 模式备用） |
| 每模块生成 | `index.html` | 组装页面，引用骨架 |
| 每模块生成 | `logic-docs.html` | 逻辑说明（http 模式备用） |

## file:// 与 http 行为

| 能力 | file:// | http 静态服务 |
|------|---------|---------------|
| 列表 / 筛选 / CRUD | ✅ 内嵌 mockData + localStorage | ✅ |
| 逻辑说明 / 变更公告弹窗 | ✅ 内嵌 + 弹窗交互 | ✅ |
| 修改 data.json 后刷新 | ❌ 改 spec 重新 generate | ✅ fetch 生效 |

## 槽位字段

见 `schema/module.spec.schema.json` 与 `examples/demo-list.spec.json`。

## 与问答 Agent 集成

启动 `npm start` 后，后端会挂载 `/api/prototype-files` 指向本目录，并扫描 `generated/` 维护原型注册表。

流程：**✏️ 新建原型** 或对话收集 spec → 调用 `tools/generate.py` → 输出到 `generated/{pageId}/` → **📐 原型预览** 通过 `/api/prototype-files/generated/...` 访问。
