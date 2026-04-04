"""
Cloudinary upload and management utilities.
"""

import cloudinary
import cloudinary.uploader
from typing import Optional

from app.config import settings


def configure_cloudinary():
    """Initialize Cloudinary with credentials."""
    if all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        return True
    return False


async def upload_image(
    file_data,
    folder: str = "theogmenu",
    public_id: Optional[str] = None,
    transformation: dict = None,
) -> dict:
    """
    Upload an image to Cloudinary.
    Returns dict with 'url', 'thumbnail_url', 'public_id'.
    """
    upload_options = {
        "folder": folder,
        "resource_type": "image",
        "quality": "auto:good",
        "fetch_format": "auto",
    }
    if public_id:
        upload_options["public_id"] = public_id
    if transformation:
        upload_options["transformation"] = transformation

    result = cloudinary.uploader.upload(file_data, **upload_options)

    # Generate thumbnail URL
    thumbnail_url = cloudinary.utils.cloudinary_url(
        result["public_id"],
        width=300,
        height=300,
        crop="fill",
        quality="auto:low",
        fetch_format="auto",
    )[0]

    return {
        "url": result["secure_url"],
        "thumbnail_url": thumbnail_url,
        "public_id": result["public_id"],
    }


async def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
