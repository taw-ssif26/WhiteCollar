import boto3
import uuid
import logging
from botocore.exceptions import ClientError
from config import settings

logger = logging.getLogger(__name__)


def _get_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


async def upload_photo(file_bytes: bytes, content_type: str, folder: str = "students") -> str | None:
    """Upload a photo to R2. Returns the public URL or None on failure."""
    if not settings.R2_ACCOUNT_ID:
        logger.warning("R2 not configured — photo upload skipped")
        return None

    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    try:
        client = _get_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return f"{settings.R2_PUBLIC_URL}/{key}"
    except ClientError as e:
        logger.error(f"R2 upload failed: {e}")
        return None


async def delete_photo(url: str) -> bool:
    """Delete a photo from R2 by its public URL."""
    if not settings.R2_ACCOUNT_ID or not url:
        return False
    try:
        key = url.replace(f"{settings.R2_PUBLIC_URL}/", "")
        client = _get_client()
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
        return True
    except ClientError as e:
        logger.error(f"R2 delete failed: {e}")
        return False
