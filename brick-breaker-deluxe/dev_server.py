#!/usr/bin/env python3
"""
Local dev server with live reload (port 8001 by default).

Usage:
  python3 dev_server.py
  python3 dev_server.py 8001

Drop-in replacement for: python3 -m http.server 8001
"""

from __future__ import annotations

import argparse
import http.server
import json
import mimetypes
import queue
import socketserver
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEFAULT_PORT = 8001
WATCH_EXTENSIONS = {".html", ".css", ".js", ".mp3", ".wav", ".ogg", ".json"}
RELOAD_SCRIPT = """
<script id="__dev_reload__">
(function () {
  var es = new EventSource("/__dev_reload__/events");
  es.onmessage = function () { location.reload(); };
  es.onerror = function () { es.close(); };
})();
</script>
""".strip()
SSE_PATH = "/__dev_reload__/events"


class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, reload_queue: queue.Queue[str] | None = None, **kwargs):
        self.reload_queue = reload_queue
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:
        if args and isinstance(args[0], str) and args[0].startswith(SSE_PATH):
            return
        super().log_message(format, *args)

    def do_GET(self) -> None:
        if self.path == SSE_PATH or self.path.startswith(SSE_PATH + "?"):
            self._serve_sse()
            return
        if self._should_inject_reload():
            self._serve_with_reload()
            return
        super().do_GET()

    def _sse_write(self, data: bytes) -> bool:
        try:
            self.wfile.write(data)
            self.wfile.flush()
            return True
        except (BrokenPipeError, ConnectionResetError):
            return False

    def _serve_sse(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        if not self.reload_queue:
            self._sse_write(b"data: connected\n\n")
            return

        if not self._sse_write(b": connected\n\n"):
            return

        while True:
            try:
                reason = self.reload_queue.get(timeout=25)
            except queue.Empty:
                if not self._sse_write(b": ping\n\n"):
                    break
                continue

            payload = json.dumps({"reason": reason})
            if not self._sse_write(f"data: {payload}\n\n".encode()):
                break

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _inject_reload_script(self, content: bytes) -> bytes:
        marker = b"</body>"
        lower = content.lower()
        idx = lower.rfind(marker)
        if idx == -1:
            return content + b"\n" + RELOAD_SCRIPT.encode() + b"\n"
        return content[:idx] + RELOAD_SCRIPT.encode() + b"\n" + content[idx:]

    def _serve_with_reload(self) -> None:
        path = self.translate_path(self.path)
        if Path(path).is_dir():
            for name in ("index.html", "index.htm"):
                index = Path(path) / name
                if index.is_file():
                    path = str(index)
                    break
            else:
                self.send_error(http.server.HTTPStatus.NOT_FOUND, "No index file")
                return

        try:
            with open(path, "rb") as handle:
                content = self._inject_reload_script(handle.read())
        except OSError:
            self.send_error(http.server.HTTPStatus.NOT_FOUND, "File not found")
            return

        content_type, _ = mimetypes.guess_type(path)
        self.send_response(http.server.HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "text/html")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _should_inject_reload(self) -> bool:
        path = self.path.split("?", 1)[0]
        return path == "/" or path.endswith(".html")


def collect_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in WATCH_EXTENSIONS:
            files.append(path)
    return files


def watch_files(root: Path, reload_queue: queue.Queue[str], interval: float = 0.4) -> None:
    tracked: dict[Path, float] = {}

    def snapshot() -> dict[Path, float]:
        return {path: path.stat().st_mtime for path in collect_files(root)}

    tracked = snapshot()

    while True:
        time.sleep(interval)
        current = snapshot()

        changed: list[Path] = []
        for path, mtime in current.items():
            if tracked.get(path) != mtime:
                changed.append(path)

        for path in tracked:
            if path not in current:
                changed.append(path)

        if not changed:
            continue

        tracked = current
        names = ", ".join(p.relative_to(root).as_posix() for p in changed[:3])
        if len(changed) > 3:
            names += f" (+{len(changed) - 3} more)"
        print(f"[live reload] {names}")
        reload_queue.put(names)


def run_server(port: int) -> None:
    reload_queue: queue.Queue[str] = queue.Queue()

    handler = lambda *args, **kwargs: LiveReloadHandler(
        *args, reload_queue=reload_queue, **kwargs
    )

    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with ThreadingHTTPServer(("", port), handler) as httpd:
        watcher = threading.Thread(
            target=watch_files, args=(ROOT, reload_queue), daemon=True
        )
        watcher.start()

        url = f"http://127.0.0.1:{port}/"
        print(f"Serving {ROOT}")
        print(f"Live reload: {url}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="HTTP server with live reload (replaces python3 -m http.server)."
    )
    parser.add_argument(
        "port",
        nargs="?",
        type=int,
        default=DEFAULT_PORT,
        help=f"port to listen on (default: {DEFAULT_PORT})",
    )
    args = parser.parse_args()
    run_server(args.port)


if __name__ == "__main__":
    main()
