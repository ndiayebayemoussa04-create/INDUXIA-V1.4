"""INDUXIA V1.4 - Main Application Entrypoint
Provides FastAPI / WSGI routing with Python stdlib fallback HTTP server.
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Ensure root directory is accessible
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.llm.config import get_config
from backend.api.llm import get_version_info, get_llm_status, get_llm_models, handle_generate, get_diagnostics
from backend.api.benchmark import run_benchmark_endpoint, get_benchmark_results_endpoint


class InduxiaHTTPHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/version":
            self._send_json(200, get_version_info())
        elif path == "/api/llm/status":
            self._send_json(200, get_llm_status())
        elif path == "/api/llm/models":
            self._send_json(200, get_llm_models())
        elif path == "/api/system/diagnostics":
            self._send_json(200, get_diagnostics())
        elif path == "/api/benchmark/results":
            self._send_json(200, get_benchmark_results_endpoint())
        else:
            self._send_json(404, {"error": "Not Found", "path": path})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        if path == "/api/llm/generate":
            result = handle_generate(payload)
            self._send_json(200, result)
        elif path == "/api/benchmark/run":
            result = run_benchmark_endpoint(payload)
            self._send_json(200, result)
        else:
            self._send_json(404, {"error": "Not Found", "path": path})


def run_server(port: int = 8000, host: str = "0.0.0.0"):
    print(f"INDUXIA V1.4 Python Backend running on http://{host}:{port}")
    server = HTTPServer((host, port), InduxiaHTTPHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping INDUXIA Python backend.")
        server.server_close()


if __name__ == "__main__":
    cfg = get_config()
    run_server(port=cfg.port, host=cfg.host)
