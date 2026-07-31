import io
import os
import uuid

from databricks.sdk import WorkspaceClient

# Reuses the existing sbfo_ro volume; IPAM attachments live under their own subfolder,
# one directory per campaign_id.
VOLUME_ROOT = os.getenv("DATABRICKS_VOLUME_PATH", "/Volumes/budmp_sbfo_dev/riskandopportunity/sbfo_ro")
ATTACHMENTS_SUBFOLDER = "ipam_attachments"

_client = None


def _w() -> WorkspaceClient:
    global _client
    if _client is None:
        _client = WorkspaceClient()
    return _client


def upload_attachment(campaign_id: str, filename: str, data: bytes) -> str:
    """Uploads bytes to the volume under a per-campaign folder and returns the volume path.

    The stored object name is a random uuid (+ original extension), never the
    user-supplied filename, so path traversal / odd characters in `filename` can
    never reach the volume path — the human-readable name only lives in Postgres.
    """
    ext = os.path.splitext(filename)[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = f"{VOLUME_ROOT}/{ATTACHMENTS_SUBFOLDER}/{campaign_id}"
    _w().files.create_directory(dest_dir)
    dest_path = f"{dest_dir}/{stored_name}"
    _w().files.upload(dest_path, io.BytesIO(data), overwrite=True)
    return dest_path


def download_attachment(volume_path: str) -> bytes:
    resp = _w().files.download(volume_path)
    with resp.contents as f:
        return f.read()


def delete_attachment(volume_path: str):
    try:
        _w().files.delete(volume_path)
    except Exception:
        pass
