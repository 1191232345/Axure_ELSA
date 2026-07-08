"""前端自动编译与源码监听。"""
from __future__ import annotations

import subprocess
import threading
from pathlib import Path

from config import DEMO_DIR, DEMO_DIST, FRONTEND_AUTO_BUILD, FRONTEND_WATCH

_WATCH_ROOTS = (
    DEMO_DIR / "src",
    DEMO_DIR / "index.html",
    DEMO_DIR / "vite.config.ts",
    DEMO_DIR / "tsconfig.json",
)

_watcher: FrontendWatcher | None = None
_build_lock = threading.Lock()
_building = False
_rebuild_pending = False


def _dist_ready() -> bool:
    return (DEMO_DIST / "index.html").is_file()


def _can_npm_build() -> bool:
    """是否已安装 demo 依赖，可执行 npm run build。"""
    return (DEMO_DIR / "node_modules" / ".bin" / "tsc").is_file()


def build_frontend() -> None:
    """在 demo 目录执行 npm run build。"""
    if not (DEMO_DIR / "package.json").is_file():
        raise FileNotFoundError(f"未找到前端项目：{DEMO_DIR / 'package.json'}")

    print("正在编译前端…", flush=True)
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        if result.stdout.strip():
            print(result.stdout, flush=True)
        if result.stderr.strip():
            print(result.stderr, flush=True)
        raise RuntimeError(
            f"前端编译失败 (exit {result.returncode})。"
            f"请确认已执行：cd demo && npm install"
        )
    print(f"前端编译完成 → {DEMO_DIST}", flush=True)


def _needs_build() -> bool:
    index = DEMO_DIST / "index.html"
    if not index.is_file():
        return True

    dist_mtime = index.stat().st_mtime
    for root in _WATCH_ROOTS:
        if not root.exists():
            continue
        if root.is_file():
            if root.stat().st_mtime > dist_mtime:
                return True
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.stat().st_mtime > dist_mtime:
                return True
    return False


def prepare_frontend() -> None:
    """启动前确保 dist 可用（缺失或源码更新时自动编译）。"""
    if not FRONTEND_AUTO_BUILD:
        if not _dist_ready():
            raise RuntimeError(
                f"前端未构建：{DEMO_DIST}\n"
                "请执行 cd demo && npm install && npm run build，"
                "或设置 FRONTEND_AUTO_BUILD=true"
            )
        return

    if not _needs_build():
        return

    if not _can_npm_build():
        if _dist_ready():
            print(
                "提示：检测到前端源码比 dist 新，但未安装 Node 依赖（demo/node_modules）。"
                "将直接使用已有 demo/dist 启动；如需最新页面请执行："
                "cd demo && npm install && npm run build",
                flush=True,
            )
            return
        raise RuntimeError(
            f"前端未构建：{DEMO_DIST}\n"
            "且无法自动编译（缺少 demo/node_modules）。"
            "请执行：cd demo && npm install && npm run build"
        )

    build_frontend()


def _run_build_once() -> None:
    global _building, _rebuild_pending

    with _build_lock:
        if _building:
            _rebuild_pending = True
            return
        _building = True

    try:
        if not _can_npm_build():
            if _dist_ready():
                print(
                    "提示：前端源码已变更但未安装 Node 依赖，跳过自动编译，继续使用 demo/dist",
                    flush=True,
                )
                return
            build_frontend()
            return
        build_frontend()
    except RuntimeError as err:
        print(err, flush=True)
    finally:
        with _build_lock:
            _building = False
            pending = _rebuild_pending
            _rebuild_pending = False
        if pending:
            _run_build_once()


class FrontendWatcher:
    """轮询 demo 源码变更并 debounce 触发重新编译。"""

    def __init__(self, interval: float = 1.0, debounce: float = 0.8) -> None:
        self._interval = interval
        self._debounce = debounce
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._timer: threading.Timer | None = None
        self._snapshots: dict[str, float] = {}

    def _snapshot(self) -> dict[str, float]:
        out: dict[str, float] = {}
        for root in _WATCH_ROOTS:
            if not root.exists():
                continue
            if root.is_file():
                out[str(root)] = root.stat().st_mtime
                continue
            for path in root.rglob("*"):
                if path.is_file():
                    out[str(path)] = path.stat().st_mtime
        return out

    def _schedule_rebuild(self) -> None:
        if self._timer:
            self._timer.cancel()
        self._timer = threading.Timer(self._debounce, _run_build_once)
        self._timer.daemon = True
        self._timer.start()

    def _loop(self) -> None:
        self._snapshots = self._snapshot()
        while not self._stop.wait(self._interval):
            current = self._snapshot()
            if current != self._snapshots:
                self._snapshots = current
                print("检测到前端源码变更，准备重新编译…", flush=True)
                self._schedule_rebuild()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, name="frontend-watcher", daemon=True)
        self._thread.start()
        print("前端源码监听已开启（修改 demo/src 后自动编译）", flush=True)

    def stop(self) -> None:
        self._stop.set()
        if self._timer:
            self._timer.cancel()
            self._timer = None
        if self._thread:
            self._thread.join(timeout=2)
            self._thread = None


def start_frontend_watcher() -> FrontendWatcher | None:
    global _watcher
    if not FRONTEND_WATCH:
        return None
    _watcher = FrontendWatcher()
    _watcher.start()
    return _watcher


def stop_frontend_watcher() -> None:
    global _watcher
    if _watcher:
        _watcher.stop()
        _watcher = None
