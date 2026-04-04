"""
Restaurant schemas — request/response DTOs.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class RestaurantCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255, pattern=r"^[a-z0-9-]+$")
    description: Optional[str] = None
    google_maps_url: Optional[str] = None
    address: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
    is_active: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}
