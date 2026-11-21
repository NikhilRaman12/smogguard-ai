import os
import sys

# Ensure local SQLite DB and paths are wired for direct standalone execution
project_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(project_root, "backend")
db_file = os.path.join(backend_dir, "smogguard.db").replace("\\", "/")

os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_file}"
os.environ["GEMINI_API_KEY"] = os.environ.get("GEMINI_API_KEY", "demo-local-key")
os.environ["WAQI_API_TOKEN"] = os.environ.get("WAQI_API_TOKEN", "demo")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn
from app.main import app

if __name__ == "__main__":
    print(f"Starting SmogGuard AI Backend on http://127.0.0.1:8000 (Database: {db_file})")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
