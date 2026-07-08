#!/usr/bin/env python3
"""从 module.spec.json 生成原型模块（引用 prototype-skeleton 骨架）。"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent
TEMPLATE = ROOT / "templates" / "index.html.template"


def _load_spec(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("spec 必须是 JSON 对象")
    if not data.get("pageId"):
        raise ValueError("spec 缺少 pageId")
    if not data.get("moduleName"):
        raise ValueError("spec 缺少 moduleName")
    data.setdefault("dataFile", f"data/{data['pageId']}-data.json")
    data.setdefault("version", "1.0.0")
    return data


def os_path_relpath(target: Path, base: Path) -> str:
    import os

    return os.path.relpath(target, base)


def _href_dir(target: Path, from_dir: Path) -> str:
    rel = Path(os_path_relpath(target, from_dir)).as_posix()
    if not rel.endswith("/"):
        rel += "/"
    return rel


def _logic_table(headers: list[str], rows: list[list[str]]) -> str:
    head = "".join(
        f'<th class="px-3 py-2 text-left font-medium text-gray-700 border-b">{h}</th>' for h in headers
    )
    body_rows = []
    for row in rows:
        cells = "".join(f'<td class="px-3 py-2 text-gray-600">{c}</td>' for c in row)
        body_rows.append(f'<tr class="hover:bg-gray-50">{cells}</tr>')
    return (
        '<div class="overflow-x-auto"><table class="min-w-full text-sm border border-gray-200 rounded">'
        f"<thead class=\"bg-gray-50\"><tr>{head}</tr></thead>"
        f"<tbody>{''.join(body_rows)}</tbody></table></div>"
    )


def _logic_card(title: str, icon: str, table_html: str) -> str:
    return f"""<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
    <h4 class="font-semibold text-gray-800 flex items-center">
      <i class="fas {icon} text-primary mr-2"></i>{title}
    </h4>
  </div>
  <div class="p-4">{table_html}</div>
</div>"""


def render_logic_docs(spec: dict) -> str:
    docs = spec.get("logicDocs") or {}
    sections = []
    if docs.get("init"):
        sections.append(_logic_card(
            "初始化页面（数据展示逻辑）",
            "fa-play-circle",
            _logic_table(["逻辑项", "说明", "数据来源", "展示规则"], docs["init"]),
        ))
    if docs.get("filters"):
        sections.append(_logic_card(
            "检索条件",
            "fa-search",
            _logic_table(["检索项", "输入方式", "逻辑说明"], docs["filters"]),
        ))
    if docs.get("buttons"):
        sections.append(_logic_card(
            "模块按钮逻辑",
            "fa-mouse-pointer",
            _logic_table(["按钮", "位置", "前置条件", "后续操作"], docs["buttons"]),
        ))
    if docs.get("fields"):
        sections.append(_logic_card(
            "属性取值逻辑",
            "fa-list-alt",
            _logic_table(["字段", "名称", "类型", "必填", "取值说明"], docs["fields"]),
        ))
    return (
        "".join(sections)
        or '<p class="text-gray-500">请在 spec.logicDocs 中补充逻辑说明。</p>'
    )


def render_index(spec: dict, out_dir: Path) -> str:
    html = TEMPLATE.read_text(encoding="utf-8")
    skeleton_href = _href_dir(ROOT, out_dir)
    return (
        html.replace("{{MODULE_NAME}}", spec["moduleName"])
        .replace("{{SKELETON_REL}}", skeleton_href)
    )


def write_module_config(spec: dict, path: Path, *, logic_html: str) -> None:
    runtime = dict(spec)
    runtime["mockData"] = spec.get("mockData") or []
    runtime["logicDocsHtml"] = logic_html
    if "changelog" in spec:
        runtime["changelog"] = spec["changelog"]
    runtime.pop("logicDocs", None)
    text = "window.MODULE_SPEC = " + json.dumps(runtime, ensure_ascii=False, indent=2) + ";\n"
    path.write_text(text, encoding="utf-8")


def sync_runtime(spec: dict, output_dir: Path, *, bootstrap_html: bool = False) -> Path:
    """同步 spec 运行时产物：module.spec.json、module-config.js、mock 数据。

    index.html / logic-docs.html 仅在 bootstrap_html=True 或 index.html 缺失时写入。
    """
    out = output_dir
    out.mkdir(parents=True, exist_ok=True)
    (out / "data").mkdir(exist_ok=True)
    (out / "js").mkdir(exist_ok=True)

    data_file = str(spec.get("dataFile") or f"data/{spec['pageId']}-data.json")
    mock = spec.get("mockData") or []
    data_path = out / data_file
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(json.dumps(mock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    spec_copy = dict(spec)
    spec_copy["dataFile"] = data_file
    (out / "module.spec.json").write_text(
        json.dumps(spec_copy, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    logic_html = render_logic_docs(spec)
    write_module_config(
        spec,
        out / "js" / "module-config.js",
        logic_html=logic_html,
    )

    index_path = out / "index.html"
    if bootstrap_html or not index_path.is_file():
        index_path.write_text(render_index(spec, out), encoding="utf-8")
        (out / "logic-docs.html").write_text(logic_html, encoding="utf-8")

    return out


def generate(spec_path: Path, output_dir: Path | None = None) -> Path:
    spec = _load_spec(spec_path)
    out = output_dir or (ROOT / "generated" / spec["pageId"])
    return sync_runtime(spec, out, bootstrap_html=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="从 module.spec.json 生成原型模块")
    parser.add_argument("spec", type=Path, help="spec JSON 路径")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="输出目录（默认 prototype-skeleton/generated/{pageId}）",
    )
    parser.add_argument(
        "--sync-only",
        action="store_true",
        help="仅同步 spec 运行时产物（module-config.js 等），不强制重写 index.html",
    )
    args = parser.parse_args(argv)
    spec_path = args.spec if args.spec.is_absolute() else Path.cwd() / args.spec
    if not spec_path.exists():
        print(f"错误：找不到 spec 文件 {spec_path}", file=sys.stderr)
        return 1
    if args.sync_only:
        spec = _load_spec(spec_path)
        out_dir = args.output or (ROOT / "generated" / spec["pageId"])
        out = sync_runtime(spec, out_dir, bootstrap_html=False)
    else:
        out = generate(spec_path, args.output)
    index_file = (out / "index.html").resolve()
    print(f"已生成模块：{out}")
    print(f"预览（双击或浏览器打开）：file://{index_file.as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
