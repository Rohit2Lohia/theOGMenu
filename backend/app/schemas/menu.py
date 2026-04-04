"""
Menu, Category, and Item schemas — request/response DTOs.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from decimal import Decimal


# ── Menu ──────────────────────────────────────────────

class MenuCreate(BaseModel):
    name: str = Field(..., max_length=255)
    is_default: bool = False
    is_active: bool = True
    sort_order: int = 0


class MenuUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class MenuResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    name: str
    is_default: bool
    is_active: bool
    sort_order: int

    model_config = {"from_attributes": True}


# ── Category ──────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=255)
    name_translations: Optional[dict] = None
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    name_translations: Optional[dict] = None
    icon: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: UUID
    menu_id: UUID
    name: str
    name_translations: Optional[dict] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int
    is_active: bool

    model_config = {"from_attributes": True}


# ── Item ──────────────────────────────────────────────

class ItemCreate(BaseModel):
    name: str = Field(..., max_length=255)
    name_translations: Optional[dict] = None
    description: Optional[str] = None
    description_translations: Optional[dict] = None
    price: Decimal = Field(..., ge=0)
    discounted_price: Optional[Decimal] = Field(None, ge=0)
    food_type: str = Field("veg", pattern=r"^(veg|non-veg|egg|vegan)$")
    is_bestseller: bool = False
    is_new: bool = False
    is_spicy: bool = False
    is_available: bool = True
    allergens: Optional[list] = None
    variants: Optional[dict] = None
    addons: Optional[list] = None
    sort_order: int = 0


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    name_translations: Optional[dict] = None
    description: Optional[str] = None
    description_translations: Optional[dict] = None
    price: Optional[Decimal] = Field(None, ge=0)
    discounted_price: Optional[Decimal] = Field(None, ge=0)
    image_url: Optional[str] = None
    food_type: Optional[str] = Field(None, pattern=r"^(veg|non-veg|egg|vegan)$")
    is_bestseller: Optional[bool] = None
    is_new: Optional[bool] = None
    is_spicy: Optional[bool] = None
    is_available: Optional[bool] = None
    allergens: Optional[list] = None
    variants: Optional[dict] = None
    addons: Optional[list] = None
    sort_order: Optional[int] = None


class ItemResponse(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    name_translations: Optional[dict] = None
    description: Optional[str] = None
    description_translations: Optional[dict] = None
    price: Decimal
    discounted_price: Optional[Decimal] = None
    image_url: Optional[str] = None
    food_type: str
    is_bestseller: bool
    is_new: bool
    is_spicy: bool
    is_available: bool
    allergens: Optional[list] = None
    variants: Optional[dict] = None
    addons: Optional[list] = None
    sort_order: int

    model_config = {"from_attributes": True}
