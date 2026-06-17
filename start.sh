#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build React frontend if dist doesn't exist
DIST_DIR="$SCRIPT_DIR/frontend/dist"
if [ ! -d "$DIST_DIR" ]; then
    echo "Building React frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm install --silent
    npm run build
    echo "Frontend build complete."
else
    echo "Frontend dist already exists, skipping build."
fi

# Install Python dependencies
echo "Installing Python dependencies..."
cd "$SCRIPT_DIR"
pip install -r requirements.txt --quiet

# Start FastAPI backend
echo "Starting app on port ${DATABRICKS_APP_PORT:-8000}..."
uvicorn databricks_app:app --host 0.0.0.0 --port ${DATABRICKS_APP_PORT:-8000}
