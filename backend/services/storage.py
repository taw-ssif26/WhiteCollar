import httpx
import uuid
import logging
from config import settings

logger = logging.getLogger(__name__)


async def upload_photo(file_bytes: bytes, content_type: str, folder: str = "students") -> str | None:
    """
    Upload a photo to Supabase Storage.
    Returns the public URL or None on failure.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Supabase not configured — photo upload skipped")
        return None

    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    filename = f"{folder}/{uuid.uuid4()}.{ext}"
    bucket = settings.SUPABASE_BUCKET

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{filename}"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                content=file_bytes,
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
            )
            response.raise_for_status()

        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}"
        logger.info(f"Photo uploaded: {public_url}")
        return public_url

    except Exception as e:
        logger.error(f"Supabase upload failed: {e}")
        return None


async def delete_photo(url: str) -> bool:
    """Delete a photo from Supabase Storage by its public URL."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY or not url:
        return False

    try:
        # Extract the file path from the URL
        # URL format: .../storage/v1/object/public/{bucket}/{folder}/{filename}
        marker = "/object/public/"
        idx = url.find(marker)
        if idx == -1:
            return False
        path_after_public = url[idx + len(marker):]
        # path_after_public = "{bucket}/{folder}/{filename}"
        parts = path_after_public.split("/", 1)
        if len(parts) < 2:
            return False
        bucket, file_path = parts[0], parts[1]

        delete_url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{file_path}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(
                delete_url,
                headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"},
            )
            return response.status_code in (200, 204)

    except Exception as e:
        logger.error(f"Supabase delete failed: {e}")
        return False
