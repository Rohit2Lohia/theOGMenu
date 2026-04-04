"""
Restaurant service — business logic for restaurant management.
"""

import re
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.restaurant import Restaurant
from app.models.menu import Menu
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from a restaurant name."""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    return slug


async def create_restaurant(
    db: AsyncSession, owner_id: UUID, data: RestaurantCreate
) -> Restaurant:
    """Create a new restaurant with a default menu."""
    # Check slug uniqueness
    existing = await get_restaurant_by_slug(db, data.slug)
    if existing:
        # Append a suffix to make unique
        base_slug = data.slug
        counter = 1
        while existing:
            data.slug = f"{base_slug}-{counter}"
            existing = await get_restaurant_by_slug(db, data.slug)
            counter += 1

    restaurant = Restaurant(
        owner_id=owner_id,
        **data.model_dump(),
    )
    db.add(restaurant)
    await db.flush()

    # Create a default menu
    default_menu = Menu(
        restaurant_id=restaurant.id,
        name="Main Menu",
        is_default=True,
        is_active=True,
        sort_order=0,
    )
    db.add(default_menu)
    await db.flush()

    return restaurant


async def get_restaurant_by_slug(
    db: AsyncSession, slug: str
) -> Optional[Restaurant]:
    """Get a restaurant by its URL slug."""
    stmt = select(Restaurant).where(Restaurant.slug == slug)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_restaurant_by_id(
    db: AsyncSession, restaurant_id: UUID
) -> Optional[Restaurant]:
    """Get a restaurant by ID."""
    stmt = select(Restaurant).where(Restaurant.id == restaurant_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_restaurants_by_owner(
    db: AsyncSession, owner_id: UUID
) -> list[Restaurant]:
    """Get all restaurants owned by a user."""
    stmt = select(Restaurant).where(Restaurant.owner_id == owner_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_restaurant(
    db: AsyncSession, restaurant_id: UUID, data: RestaurantUpdate
) -> Optional[Restaurant]:
    """Update a restaurant's details."""
    restaurant = await get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    await db.flush()
    return restaurant
