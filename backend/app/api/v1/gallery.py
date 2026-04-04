"""
Gallery API routes.
"""

from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.gallery import GalleryImageResponse
from app.services import gallery_service, restaurant_service
from app.utils.cloudinary_utils import upload_image

router = APIRouter(tags=["Gallery"])

@router.get("/restaurants/{restaurant_id}/gallery", response_model=List[GalleryImageResponse])
async def get_restaurant_gallery(
    restaurant_id: UUID,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all gallery images for a restaurant."""
    return await gallery_service.get_gallery_images(db, restaurant_id, category)

@router.post(
    "/restaurants/{restaurant_id}/gallery",
    response_model=GalleryImageResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_restaurant_gallery_image(
    restaurant_id: UUID,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    category: str = Form("food"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new gallery image."""
    restaurant = await restaurant_service.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")
        
    try:
        data = await file.read()
        cloud_result = await upload_image(data, folder=f"theogmenu/restaurants/{restaurant_id}/gallery")
        
        image = await gallery_service.create_gallery_image(
            db=db,
            restaurant_id=restaurant_id,
            url=cloud_result["url"],
            thumbnail_url=cloud_result["thumbnail_url"],
            public_id=cloud_result["public_id"],
            caption=caption,
            category=category,
        )
        return image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.delete("/gallery/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_gallery_image(
    image_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a gallery image."""
    success = await gallery_service.delete_gallery_image(db, image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
