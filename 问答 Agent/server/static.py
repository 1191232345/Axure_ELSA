"""前端静态资源。"""
from __future__ import annotations

from fastapi import HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from config import DEMO_DIST, PROTOTYPE_SKELETON_DIR


def ensure_dist() -> None:
    if not (DEMO_DIST / "index.html").is_file():
        raise FileNotFoundError(
            f"前端未构建：{DEMO_DIST}\n"
            "请执行 cd demo && npm install && npm run build"
        )


def mount_frontend(app) -> None:
    ensure_dist()
    assets_dir = DEMO_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend-assets")

    @app.get("/")
    async def index():
        return FileResponse(DEMO_DIST / "index.html", media_type="text/html")

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        target = DEMO_DIST / "favicon.ico"
        if target.is_file():
            return FileResponse(target)
        raise HTTPException(404, "Not Found")

    print(f"前端静态目录：{DEMO_DIST}")


def mount_prototype_files(app) -> None:
    if not PROTOTYPE_SKELETON_DIR.is_dir():
        print(f"警告：未找到 prototype-skeleton 目录：{PROTOTYPE_SKELETON_DIR}")
        return
    app.mount(
        "/api/prototype-files",
        StaticFiles(directory=str(PROTOTYPE_SKELETON_DIR)),
        name="prototype-files",
    )
    print(f"原型静态目录：{PROTOTYPE_SKELETON_DIR}")
