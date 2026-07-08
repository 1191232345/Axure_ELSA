"""原型运行时同步：仅更新 spec 驱动的 module-config.js 等，不重写固定 HTML 壳。"""
from __future__ import annotations

import importlib.util
import json
from functools import lru_cache
from pathlib import Path

from config import PROTOTYPE_SKELETON_DIR, PROTOTYPES_DIR


@lru_cache(maxsize=1)
def _generate_module():
    path = PROTOTYPE_SKELETON_DIR / "tools" / "generate.py"
    if not path.is_file():
        raise FileNotFoundError(f"未找到生成脚本：{path}")
    spec = importlib.util.spec_from_file_location("prototype_generate", path)
    if spec is None or spec.loader is None:
        raise ImportError(f"无法加载 {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def sync_spec_runtime(
    spec: dict,
    *,
    output_dir: Path | None = None,
    persist_spec: bool = False,
    bootstrap_html: bool = False,
) -> Path:
    """将 spec 同步到模块目录的运行时产物。

    - 始终写入：module.spec.json、js/module-config.js、mock 数据
    - persist_spec=True 时额外写入 data/prototypes/specs/{pageId}.spec.json
    - bootstrap_html=True 或 index.html 缺失时写入 index.html（草稿预览用）
    """
    page_id = str(spec.get("pageId") or "").strip()
    if not page_id:
        raise ValueError("spec 缺少 pageId")

    out_dir = output_dir or (PROTOTYPE_SKELETON_DIR / "generated" / page_id)
    generate = _generate_module()
    generate.sync_runtime(spec, out_dir, bootstrap_html=bootstrap_html)

    if persist_spec:
        spec_path = PROTOTYPES_DIR / "specs" / f"{page_id}.spec.json"
        spec_path.parent.mkdir(parents=True, exist_ok=True)
        spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if not (out_dir / "js" / "module-config.js").is_file():
        raise RuntimeError(f"同步失败：{out_dir / 'js' / 'module-config.js'} 不存在")

    return out_dir
