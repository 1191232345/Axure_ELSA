"""module.spec 校验与归一化（P0）。"""
from __future__ import annotations

import re
from copy import deepcopy

DEFAULT_STATUS_LABELS = {
    "active": {"label": "启用", "class": "badge-success"},
    "inactive": {"label": "禁用", "class": "badge-secondary"},
}

ALLOWED_ACTIONS = frozenset({"create", "export", "import", "custom"})
ALLOWED_VARIANTS = frozenset({"primary", "secondary", "danger", "purple", "accent", "success", "warning"})

# 中文/英文颜色别名 → spec variant
COLOR_VARIANT_ALIASES: dict[str, str] = {
    "紫色": "purple",
    "purple": "purple",
    "紫": "purple",
    "红色": "danger",
    "red": "danger",
    "红": "danger",
    "危险": "danger",
    "danger": "danger",
    "蓝色": "primary",
    "blue": "primary",
    "主色": "primary",
    "primary": "primary",
    "绿色": "success",
    "green": "success",
    "success": "success",
    "橙色": "warning",
    "orange": "warning",
    "warning": "warning",
    "黄色": "accent",
    "yellow": "accent",
    "accent": "accent",
    "灰色": "secondary",
    "gray": "secondary",
    "grey": "secondary",
    "次要": "secondary",
    "secondary": "secondary",
}

_COLOR_PATTERN = re.compile(
    r"(?:"
    + "|".join(re.escape(k) for k in sorted(COLOR_VARIANT_ALIASES, key=len, reverse=True))
    + r")",
    re.IGNORECASE,
)


def extract_variant_from_text(text: str) -> str | None:
    """从文本中提取按钮颜色/样式（如「紫色批量删除」→ purple）。"""
    if not text or not str(text).strip():
        return None
    match = _COLOR_PATTERN.search(str(text))
    if not match:
        return None
    key = match.group(0)
    for alias, variant in COLOR_VARIANT_ALIASES.items():
        if alias.lower() == key.lower():
            return variant
    return COLOR_VARIANT_ALIASES.get(key)


def resolve_toolbar_variant(raw: dict, action: str, label: str) -> str:
    """优先使用设计稿/指令中的显式颜色，再回退到规则推断。"""
    explicit = str(raw.get("variant") or "").strip()
    if explicit in ALLOWED_VARIANTS:
        return explicit

    color_field = str(raw.get("color") or raw.get("btnColor") or raw.get("style") or "").strip()
    if color_field:
        mapped = COLOR_VARIANT_ALIASES.get(color_field) or COLOR_VARIANT_ALIASES.get(color_field.lower())
        if mapped and mapped in ALLOWED_VARIANTS:
            return mapped
        extracted = extract_variant_from_text(color_field)
        if extracted:
            return extracted

    context = " ".join(
        str(raw.get(k) or "")
        for k in ("label", "logic", "precondition", "notes")
    )
    from_context = extract_variant_from_text(context)
    if from_context:
        return from_context

    return infer_toolbar_variant(action, label)


def merge_toolbar_styles_from_design(spec: dict, design_buttons: list[dict] | None) -> dict:
    """将设计稿中显式指定的按钮颜色写回 spec（覆盖 LLM/规则默认值）。"""
    if not design_buttons:
        return spec
    style_by_label: dict[str, str] = {}
    for item in design_buttons:
        if not isinstance(item, dict):
            continue
        label = str(item.get("label") or "").strip()
        if not label:
            continue
        action = str(item.get("action") or infer_toolbar_action(label))
        variant = resolve_toolbar_variant(item, action, label)
        explicit = extract_variant_from_text(
            " ".join(str(item.get(k) or "") for k in ("variant", "color", "logic", "precondition"))
        )
        if (
            str(item.get("variant") or "").strip() in ALLOWED_VARIANTS
            or str(item.get("color") or "").strip()
            or explicit
        ):
            style_by_label[label] = variant
    for btn in spec.get("toolbarButtons") or []:
        label = str(btn.get("label") or "")
        if label in style_by_label:
            btn["variant"] = style_by_label[label]
    return spec


def apply_instruction_toolbar_variants(spec: dict, instruction: str, ops: list[dict] | None = None) -> dict:
    """从编辑指令中提取颜色并应用到相关工具栏按钮。"""
    variant = extract_variant_from_text(instruction)
    if not variant:
        return spec

    target_labels: list[str] = []
    for op in ops or []:
        if not isinstance(op, dict):
            continue
        name = str(op.get("op") or "")
        if name == "addToolbarButton":
            label = str(op.get("label") or (op.get("item") or {}).get("label") or "").strip()
            if label:
                target_labels.append(label)
            if op.get("variant") and str(op["variant"]) in ALLOWED_VARIANTS:
                variant = str(op["variant"])
        elif name == "updateToolbarButton":
            label = str(op.get("match") or (op.get("patch") or {}).get("label") or "").strip()
            if label:
                target_labels.append(label)
            patch = op.get("patch") or {}
            if patch.get("variant") and str(patch["variant"]) in ALLOWED_VARIANTS:
                variant = str(patch["variant"])

    if not target_labels:
        for btn in spec.get("toolbarButtons") or []:
            label = str(btn.get("label") or "")
            if label and label in instruction:
                target_labels.append(label)

    for btn in spec.get("toolbarButtons") or []:
        label = str(btn.get("label") or "")
        if label in target_labels or (not target_labels and label and label in instruction):
            btn["variant"] = variant
    return spec


def infer_toolbar_action(label: str) -> str:
    text = label.strip()
    if any(k in text for k in ("新增", "创建", "添加")):
        return "create"
    if "导出" in text:
        return "export"
    if "导入" in text:
        return "import"
    return "custom"


def infer_toolbar_variant(action: str, label: str = "") -> str:
    if action == "create":
        return "primary"
    if action == "custom" and any(k in label for k in ("删除", "停用", "禁用")):
        return "danger"
    return "secondary"


def infer_toolbar_icon(action: str, label: str = "") -> str:
    if action == "create":
        return "fa-plus"
    if action == "export":
        return "fa-download"
    if action == "import":
        return "fa-upload"
    if "批量" in label:
        return "fa-layer-group"
    return "fa-cog"


def normalize_toolbar_buttons(buttons: list[dict] | None, module_name: str = "") -> list[dict]:
    normalized: list[dict] = []
    for i, raw in enumerate(buttons or []):
        if not isinstance(raw, dict):
            continue
        label = str(raw.get("label") or "").strip()
        if not label:
            continue
        action = str(raw.get("action") or infer_toolbar_action(label))
        if action not in ALLOWED_ACTIONS:
            action = infer_toolbar_action(label)
        variant = resolve_toolbar_variant(raw, action, label)
        if variant not in ALLOWED_VARIANTS:
            variant = infer_toolbar_variant(action, label)
        btn_id = str(raw.get("id") or f"toolbarBtn{i}" or "addBtn")
        btn_id = re.sub(r"[^a-zA-Z0-9_]", "", btn_id) or f"toolbarBtn{i}"
        normalized.append(
            {
                "id": btn_id,
                "label": label,
                "icon": str(raw.get("icon") or infer_toolbar_icon(action, label)),
                "action": action,
                "variant": variant,
            }
        )
    if not normalized:
        normalized.append(
            {
                "id": "addBtn",
                "label": f"新增{module_name or ''}".strip() or "新增",
                "icon": "fa-plus",
                "action": "create",
                "variant": "primary",
            }
        )
    return normalized


def _column_fields(spec: dict) -> set[str]:
    return {str(c.get("field")) for c in spec.get("columns") or [] if c.get("field")}


def _has_status_column(spec: dict) -> bool:
    return any(c.get("type") == "status" for c in spec.get("columns") or [])


def validate_spec(spec: dict) -> list[str]:
    errors: list[str] = []
    if not str(spec.get("moduleName", "")).strip():
        errors.append("缺少 moduleName")
    if not str(spec.get("pageId", "")).strip():
        errors.append("缺少 pageId")
    columns = spec.get("columns") or []
    if not columns:
        errors.append("columns 不能为空")
    fields = _column_fields(spec)
    if len(fields) < len(columns):
        errors.append("columns.field 存在重复或为空")
    for f in spec.get("filters") or []:
        field = str(f.get("field") or "")
        if field and field not in fields:
            errors.append(f"筛选字段 {field} 不在 columns 中")
    for btn in spec.get("toolbarButtons") or []:
        action = str(btn.get("action") or "")
        if action and action not in ALLOWED_ACTIONS:
            errors.append(f"非法 toolbar action: {action}")
        variant = str(btn.get("variant") or "")
        if variant and variant not in ALLOWED_VARIANTS:
            errors.append(f"非法 toolbar variant: {variant}")
    for action in spec.get("rowActions") or []:
        if str(action) not in ("view", "edit", "delete"):
            errors.append(f"非法 rowAction: {action}")
    mock = spec.get("mockData") or []
    if mock and isinstance(mock[0], dict):
        for col in columns:
            field = str(col.get("field") or "")
            if field and field not in mock[0]:
                errors.append(f"mockData 缺少字段 {field}")
    return errors


def normalize_spec(spec: dict, partial: dict) -> dict:
    """将 LLM 或规则产出归一化，并以 partial 锁定关键字段。"""
    from prototype_slots import _build_form_fields, _label_to_field

    out = deepcopy(spec)

    out["moduleName"] = str(partial.get("moduleName") or out.get("moduleName") or "")
    out["pageId"] = str(partial.get("pageId") or out.get("pageId") or "")
    out["breadcrumb"] = str(partial.get("breadcrumb") or out.get("breadcrumb") or "")
    out["pageType"] = str(partial.get("pageType") or out.get("pageType") or "list-crud")
    out["version"] = str(partial.get("version") or out.get("version") or "1.0.0")
    out["dataFile"] = str(
        partial.get("dataFile") or out.get("dataFile") or f"data/{out['pageId']}-data.json"
    )

    if partial.get("columns"):
        out["columns"] = deepcopy(partial["columns"])

    out["toolbarButtons"] = normalize_toolbar_buttons(
        out.get("toolbarButtons"),
        out["moduleName"],
    )

    row_actions = out.get("rowActions") or ["edit", "delete"]
    cleaned_actions: list[str] = []
    for action in row_actions:
        action_str = str(action)
        if action_str in ("view", "edit", "delete") and action_str not in cleaned_actions:
            cleaned_actions.append(action_str)
    out["rowActions"] = cleaned_actions or ["edit", "delete"]

    if _has_status_column(out):
        out["statusLabels"] = out.get("statusLabels") or deepcopy(DEFAULT_STATUS_LABELS)
    elif out.get("statusLabels"):
        out["statusLabels"] = out["statusLabels"]

    out["formFields"] = _build_form_fields(out.get("columns") or [])

    filters: list[dict] = []
    fields = _column_fields(out)
    for i, item in enumerate(out.get("filters") or []):
        if not isinstance(item, dict):
            continue
        field = str(item.get("field") or "")
        if field and field not in fields:
            label = str(item.get("label") or "")
            for j, col in enumerate(out.get("columns") or []):
                if str(col.get("label")) == label:
                    field = str(col.get("field"))
                    break
                field_name, _ = _label_to_field(label, i)
                if str(col.get("field")) == field_name:
                    field = field_name
                    break
        if not field:
            continue
        item = dict(item)
        item["field"] = field
        item.setdefault("id", f"filter{i}")
        filters.append(item)
    out["filters"] = filters

    mock = out.get("mockData") or []
    if not mock:
        mock_row: dict = {"id": "row_001"}
        for col in out.get("columns") or []:
            field = str(col.get("field") or "")
            if col.get("type") == "status":
                mock_row[field] = "active"
            elif col.get("type") == "datetime":
                mock_row[field] = "2026-06-27T10:00:00.000Z"
            else:
                mock_row[field] = f"示例{col.get('label', field)}"
        out["mockData"] = [mock_row]
    else:
        for row in mock:
            if isinstance(row, dict):
                row.setdefault("id", "row_001")

    logic = out.setdefault("logicDocs", {})
    if not logic.get("buttons"):
        toolbar_docs = []
        for b in out["toolbarButtons"]:
            detail = "打开表单弹窗" if b["action"] == "create" else "原型演示"
            toolbar_docs.append([b["label"], "工具栏", "无", detail])
        row_label_map = {"edit": "编辑", "delete": "删除", "view": "查看"}
        row_docs = [
            [row_label_map[a], "行操作", "无", "原型演示"]
            for a in out["rowActions"]
            if a in row_label_map
        ]
        logic["buttons"] = toolbar_docs + row_docs

    return out
