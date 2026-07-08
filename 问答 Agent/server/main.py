"""RAG API 入口。"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_WATCH, HOST, PORT, PROTOTYPE_SKELETON_DIR, RELOAD, SERVE_FRONTEND
from frontend_build import prepare_frontend, start_frontend_watcher, stop_frontend_watcher
from routes import router
from static import mount_frontend, mount_prototype_files
from kb_registry import ensure_migrated
from store import store_manager
from prototype_registry import sync_registry
from template_store import ensure_templates

if SERVE_FRONTEND:
    prepare_frontend()


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_migrated()
    ensure_templates()
    sync_registry()
    store = store_manager.reload_active()
    if store.load_cache():
        print(f"已加载知识库「{store.kb_id}」索引，共 {store.size} 个 chunk")
    else:
        print("当前知识库索引未构建，请在「📚 知识库」页预览分块并构建索引")

    watcher = start_frontend_watcher() if SERVE_FRONTEND and FRONTEND_WATCH else None
    try:
        yield
    finally:
        if watcher:
            stop_frontend_watcher()


app = FastAPI(title="岛民知识助手", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")

if SERVE_FRONTEND:
    mount_frontend(app)
mount_prototype_files(app)


if __name__ == "__main__":
    import uvicorn

    server_dir = Path(__file__).resolve().parent
    os.chdir(server_dir)
    display_host = "127.0.0.1" if HOST in {"0.0.0.0", "::"} else HOST
    print(f"打开浏览器访问: http://{display_host}:{PORT}")

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=RELOAD,
        reload_dirs=[str(server_dir)],
    )
