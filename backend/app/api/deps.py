"""
API dependencies — shared dependency injection for all routes.
"""

from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu import Menu
from app.models.category import Category
from app.models.item import Item
from app.utils.security import verify_token
from app.services.auth_service import get_user_by_id


security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that extracts and validates the JWT from the Authorization header.
    Returns the authenticated User or raises 401.
    """
    token = credentials.credentials
    payload = verify_token(token, token_type="access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = UUID(payload["sub"])
    user = await get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Optional auth — returns None if no valid token provided."""
    if not credentials:
        return None

    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        return None

    user_id = UUID(payload["sub"])
    return await get_user_by_id(db, user_id)


# ── Ownership Verification Helpers ─────────────────────
# These walk the resource chain to verify the authenticated
# user actually owns the restaurant that a resource belongs to.

async def verify_restaurant_ownership(
    db: AsyncSession, restaurant_id: UUID, user: User
) -> Restaurant:
    """Verify that the user owns the restaurant. Returns the restaurant or raises 403."""
    stmt = select(Restaurant).where(Restaurant.id == restaurant_id)
    result = await db.execute(stmt)
    restaurant = result.scalars().first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")

    return restaurant


async def verify_menu_ownership(
    db: AsyncSession, menu_id: UUID, user: User
) -> Menu:
    """Verify that the user owns the restaurant this menu belongs to."""
    stmt = select(Menu).where(Menu.id == menu_id)
    result = await db.execute(stmt)
    menu = result.scalars().first()

    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    await verify_restaurant_ownership(db, menu.restaurant_id, user)
    return menu


async def verify_category_ownership(
    db: AsyncSession, category_id: UUID, user: User
) -> Category:
    """Verify that the user owns the restaurant this category belongs to."""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalars().first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await verify_menu_ownership(db, category.menu_id, user)
    return category


async def verify_item_ownership(
    db: AsyncSession, item_id: UUID, user: User
) -> Item:
    """Verify that the user owns the restaurant this item belongs to."""
    stmt = select(Item).where(Item.id == item_id)
    result = await db.execute(stmt)
    item = result.scalars().first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await verify_category_ownership(db, item.category_id, user)
    return item
