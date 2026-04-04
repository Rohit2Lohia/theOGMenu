"""
Gallery schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class GalleryImageCreate(BaseModel):
    caption: Optional[str] = Field(None, max_length=500)
    category: str = Field("food", pattern=r"^(ambience|food|events)$")
    sort_order: int = 0


class GalleryImageResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    category: str
    sort_order: int

    model_config = {"from_attributes": True}
