"""
Gallery service — business logic for photo gallery.
Placeholder for Phase 5 implementation.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gallery import GalleryImage


async def get_gallery_images(
    db: AsyncSession, restaurant_id: UUID, category: Optional[str] = None
) -> list[GalleryImage]:
    """Get gallery images for a restaurant, optionally filtered by category."""
    stmt = (
        select(GalleryImage)
        .where(GalleryImage.restaurant_id == restaurant_id)
        .order_by(GalleryImage.sort_order)
    )
    if category:
        stmt = stmt.where(GalleryImage.category == category)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())


from app.utils.cloudinary_utils import delete_image

async def create_gallery_image(
    db: AsyncSession,
    restaurant_id: UUID,
    url: str,
    thumbnail_url: Optional[str] = None,
    public_id: Optional[str] = None,
    caption: Optional[str] = None,
    category: str = "food",
    sort_order: int = 0,
) -> GalleryImage:
    """Create a new gallery image entry."""
    image = GalleryImage(
        restaurant_id=restaurant_id,
        url=url,
        thumbnail_url=thumbnail_url,
        public_id=public_id,
        caption=caption,
        category=category,
        sort_order=sort_order,
    )
    db.add(image)
    await db.flush()
    return image


async def delete_gallery_image(db: AsyncSession, image_id: UUID) -> bool:
    """Delete a gallery image."""
    stmt = select(GalleryImage).where(GalleryImage.id == image_id)
    result = await db.execute(stmt)
    image = result.scalars().first()
    if not image:
        return False
    
    if image.public_id:
        await delete_image(image.public_id)

    await db.delete(image)
    await db.flush()
    return True
