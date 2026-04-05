"""
Restaurant API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, RestaurantResponse, RestaurantStatsResponse
from app.services import restaurant_service
from uuid import UUID

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.post("/", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    data: RestaurantCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new restaurant."""
    restaurant = await restaurant_service.create_restaurant(db, user.id, data)
    return restaurant


@router.get("/", response_model=list[RestaurantResponse])
async def list_my_restaurants(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all restaurants owned by the current user."""
    return await restaurant_service.get_restaurants_by_owner(db, user.id)


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific restaurant by ID."""
    from uuid import UUID
    restaurant = await restaurant_service.get_restaurant_by_id(db, UUID(restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")
    return restaurant


@router.patch("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    data: RestaurantUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a restaurant's details."""
    from uuid import UUID
    restaurant = await restaurant_service.get_restaurant_by_id(db, UUID(restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")

    updated = await restaurant_service.update_restaurant(db, UUID(restaurant_id), data)
    return updated


@router.get("/public/{slug}", response_model=RestaurantResponse)
async def get_restaurant_public(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a restaurant by slug (public, no auth required)."""
    restaurant = await restaurant_service.get_restaurant_by_slug(db, slug)
    if not restaurant or not restaurant.is_active:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/public/id/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant_public_by_id(
    restaurant_id: str,
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID
    restaurant = await restaurant_service.get_restaurant_by_id(db, UUID(restaurant_id))
    if not restaurant or not restaurant.is_active:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/{restaurant_id}/stats", response_model=RestaurantStatsResponse)
async def get_restaurant_stats(
    restaurant_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated statistics for a restaurant."""
    restaurant = await restaurant_service.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")
    
    return await restaurant_service.get_restaurant_stats(db, restaurant_id)
