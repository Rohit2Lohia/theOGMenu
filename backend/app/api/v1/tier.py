"""
Tier API routes — tier information, usage, and upgrade requests.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu import Menu
from app.tier_config import TIER_DEFINITIONS, TIER_ORDER, get_tier_limits
from app.schemas.tier import (
    TierFeatureResponse,
    TierListResponse,
    TierUsageResponse,
    TierUpgradeRequest,
    TierUpgradeResponse,
)

router = APIRouter(prefix="/tiers", tags=["Tiers"])


@router.get("/", response_model=TierListResponse)
async def list_tiers(
    user: User | None = Depends(get_optional_user),
):
    """Get all available tiers with features and pricing."""
    tiers = [
        TierFeatureResponse(**TIER_DEFINITIONS[slug])
        for slug in TIER_ORDER
    ]
    return TierListResponse(
        tiers=tiers,
        current_tier=user.tier if user else None,
    )


@router.get("/my-usage", response_model=TierUsageResponse)
async def get_my_usage(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's tier usage stats."""
    tier_info = get_tier_limits(user.tier)

    # Count restaurants
    stmt_restaurants = select(func.count(Restaurant.id)).where(
        Restaurant.owner_id == user.id
    )
    restaurants_used = (await db.execute(stmt_restaurants)).scalar() or 0

    # Count total menus across all restaurants
    stmt_menus = (
        select(func.count(Menu.id))
        .select_from(Menu)
        .join(Restaurant, Menu.restaurant_id == Restaurant.id)
        .where(Restaurant.owner_id == user.id)
    )
    menus_used = (await db.execute(stmt_menus)).scalar() or 0

    return TierUsageResponse(
        current_tier=user.tier,
        tier_name=tier_info["name"],
        restaurants_used=restaurants_used,
        restaurants_limit=tier_info["max_restaurants"],
        menus_used=menus_used,
        menus_limit=tier_info["max_menus_per_restaurant"],
    )


@router.post("/upgrade-request", response_model=TierUpgradeResponse)
async def request_upgrade(
    data: TierUpgradeRequest,
    user: User = Depends(get_current_user),
):
    """
    Submit a tier upgrade request.
    For now, this just acknowledges the request. In the future,
    this would integrate with a payment gateway.
    """
    if data.target_tier not in TIER_DEFINITIONS:
        raise HTTPException(status_code=400, detail="Invalid tier")

    current_index = TIER_ORDER.index(user.tier) if user.tier in TIER_ORDER else 0
    target_index = TIER_ORDER.index(data.target_tier)

    if target_index <= current_index:
        raise HTTPException(
            status_code=400,
            detail="You can only upgrade to a higher tier",
        )

    # TODO: In future, create an UpgradeRequest record in DB
    # and/or trigger payment flow.
    return TierUpgradeResponse(
        success=True,
        message="Your upgrade request has been received! Our team will contact you shortly to complete the upgrade.",
        current_tier=user.tier,
        requested_tier=data.target_tier,
    )
