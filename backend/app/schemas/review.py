"""
Review schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ReviewCreate(BaseModel):
    customer_name: str = Field(..., max_length=255)
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    customer_name: str
    rating: int
    comment: Optional[str] = None
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewModerate(BaseModel):
    is_approved: bool
