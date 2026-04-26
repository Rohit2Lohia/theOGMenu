"""
Tier schemas — request/response DTOs for tier management.
"""

from pydantic import BaseModel, Field
from typing import Optional


class TierFeatureResponse(BaseModel):
    name: str
    slug: str
    price_monthly: int
    price_currency: str = "INR"
    max_restaurants: int
    max_menus_per_restaurant: int
    features: list[str]
    limitations: list[str]


class TierListResponse(BaseModel):
    tiers: list[TierFeatureResponse]
    current_tier: Optional[str] = None


class TierUsageResponse(BaseModel):
    current_tier: str
    tier_name: str
    restaurants_used: int
    restaurants_limit: int  # -1 = unlimited
    menus_used: int
    menus_limit: int  # -1 = unlimited


class TierUpgradeRequest(BaseModel):
    target_tier: str = Field(..., pattern=r"^(standard|premium)$")
    message: Optional[str] = Field(None, max_length=500)


class TierUpgradeResponse(BaseModel):
    success: bool
    message: str
    current_tier: str
    requested_tier: str
