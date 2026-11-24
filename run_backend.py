import os
import sys

# Ensure local SQLite DB and paths are wired for direct standalone execution
project_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(project_root, "backend")
db_file = os.path.join(backend_dir, "smogguard.db").replace("\\", "/")

# Load environment variables from .env or .env.example if present
def load_env_file(filepath: str):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("\"'")
                    if val and val != "your_gemini_api_key_here":
                        os.environ.setdefault(key, val)

# Priority: .env, then .env.example
load_env_file(os.path.join(project_root, ".env"))
load_env_file(os.path.join(project_root, ".env.example"))

os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_file}"
if "GEMINI_API_KEY" not in os.environ:
    os.environ["GEMINI_API_KEY"] = "demo-local-key"
os.environ["WAQI_API_TOKEN"] = os.environ.get("WAQI_API_TOKEN", "demo")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn
from app.main import app

if __name__ == "__main__":
    print(f"Starting SmogGuard AI Backend on http://127.0.0.1:8000 (Database: {db_file})")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
