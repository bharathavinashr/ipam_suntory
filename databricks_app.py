"""
Databricks App Entry Point for IPAM Campaign App.
Serves the FastAPI backend + React frontend (from frontend/dist) as a single app.
"""
import os
import sys
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# Force DBX auth mode when running inside Databricks Apps
os.environ["AUTH_MODE"] = "DBX"

# Add backend to Python path so 'main' and other local modules resolve correctly
backend_path = Path(__file__).parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Import FastAPI app from backend
# We briefly change directory to the backend folder during import to ensure 
# SQLAlchemy and local imports (like models/schemas) resolve correctly.
original_cwd = os.getcwd()
try:
    os.chdir(str(backend_path))
    import main
    app = main.app
finally:
    os.chdir(original_cwd)

# Allow all origins (Databricks Apps proxy handles authentication and security)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate frontend/dist
def find_frontend_dist() -> Path | None:
    search_bases = [
        Path(__file__).parent,
        Path.cwd(),
        Path("/app/python/source_code"),
    ]
    for base in search_bases:
        dist = base / "frontend" / "dist"
        if dist.exists() and (dist / "index.html").exists():
            return dist
    return None

frontend_dist = find_frontend_dist()

if frontend_dist:
    print(f"✓ Frontend found at: {frontend_dist}")

    # Mount /assets static files (standard Vite output directory)
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def root():
        return FileResponse(str(frontend_dist / "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Let API and built-in doc routes pass through to the main router
        if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "assets/")):
            # If we reached here for an API path, it means the API route doesn't exist
            return {"detail": "Not found"}
        # For all other routes, serve index.html to allow React Router to handle the path
        return FileResponse(str(frontend_dist / "index.html"))
else:
    print("✗ frontend/dist not found — run 'cd frontend && npm run build' first")

    @app.get("/")
    async def root():
        return {
            "error": "Frontend not built.",
            "fix": "Run 'cd frontend && npm run build' within the application directory.",
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))