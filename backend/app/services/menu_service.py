"""
Menu service — business logic for menus, categories, and items.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.menu import Menu
from app.models.category import Category
from app.models.item import Item
from app.schemas.menu import (
    MenuCreate, MenuUpdate,
    CategoryCreate, CategoryUpdate,
    ItemCreate, ItemUpdate,
)


# ── Menus ─────────────────────────────────────────────

async def get_menus_by_restaurant(
    db: AsyncSession, restaurant_id: UUID
) -> list[Menu]:
    stmt = (
        select(Menu)
        .where(Menu.restaurant_id == restaurant_id)
        .order_by(Menu.sort_order)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_menu_by_id(db: AsyncSession, menu_id: UUID) -> Optional[Menu]:
    stmt = select(Menu).where(Menu.id == menu_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_menu(
    db: AsyncSession, restaurant_id: UUID, data: MenuCreate
) -> Menu:
    menu = Menu(restaurant_id=restaurant_id, **data.model_dump())
    db.add(menu)
    await db.flush()
    return menu


async def update_menu(
    db: AsyncSession, menu_id: UUID, data: MenuUpdate
) -> Optional[Menu]:
    menu = await get_menu_by_id(db, menu_id)
    if not menu:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    
    # If setting this menu as default, unset all others for this restaurant
    if update_data.get("is_default") is True:
        from sqlalchemy import update
        stmt = (
            update(Menu)
            .where(
                Menu.restaurant_id == menu.restaurant_id,
                Menu.id != menu_id
            )
            .values(is_default=False)
        )
        await db.execute(stmt)
        # Flush to make sure the unset happens before the specific update
        await db.flush()

    for field, value in update_data.items():
        setattr(menu, field, value)
        
    await db.flush()
    return menu


async def delete_menu(db: AsyncSession, menu_id: UUID) -> bool:
    menu = await get_menu_by_id(db, menu_id)
    if not menu:
        return False
    await db.delete(menu)
    await db.flush()
    return True


# ── Categories ────────────────────────────────────────

async def get_categories_by_menu(
    db: AsyncSession, menu_id: UUID
) -> list[Category]:
    stmt = (
        select(Category)
        .where(Category.menu_id == menu_id)
        .order_by(Category.sort_order)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_category_by_id(
    db: AsyncSession, category_id: UUID
) -> Optional[Category]:
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_category(
    db: AsyncSession, menu_id: UUID, data: CategoryCreate
) -> Category:
    category = Category(menu_id=menu_id, **data.model_dump())
    db.add(category)
    await db.flush()
    return category


async def update_category(
    db: AsyncSession, category_id: UUID, data: CategoryUpdate
) -> Optional[Category]:
    category = await get_category_by_id(db, category_id)
    if not category:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.flush()
    return category


async def delete_category(db: AsyncSession, category_id: UUID) -> bool:
    category = await get_category_by_id(db, category_id)
    if not category:
        return False
    await db.delete(category)
    await db.flush()
    return True


# ── Items ─────────────────────────────────────────────

async def get_items_by_category(
    db: AsyncSession, category_id: UUID
) -> list[Item]:
    stmt = (
        select(Item)
        .where(Item.category_id == category_id)
        .order_by(Item.sort_order)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_item_by_id(db: AsyncSession, item_id: UUID) -> Optional[Item]:
    stmt = select(Item).where(Item.id == item_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_item(
    db: AsyncSession, category_id: UUID, data: ItemCreate
) -> Item:
    item = Item(category_id=category_id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_item(
    db: AsyncSession, item_id: UUID, data: ItemUpdate
) -> Optional[Item]:
    item = await get_item_by_id(db, item_id)
    if not item:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.add(item)
    await db.commit() # Explicit commit for safety
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item_id: UUID) -> bool:
    item = await get_item_by_id(db, item_id)
    if not item:
        return False
    await db.delete(item)
    await db.flush()
    return True


async def toggle_item_availability(
    db: AsyncSession, item_id: UUID
) -> Optional[Item]:
    """Quick toggle for item availability (most common admin action)."""
    item = await get_item_by_id(db, item_id)
    if not item:
        return None
    item.is_available = not item.is_available
    await db.flush()
    return item


async def get_active_menu_for_restaurant(
    db: AsyncSession, restaurant_id: UUID
) -> Optional[Menu]:
    """Get the first active/default menu for a restaurant."""
    stmt = (
        select(Menu)
        .where(
            Menu.restaurant_id == restaurant_id,
            Menu.is_active == True
        )
        .order_by(Menu.is_default.desc(), Menu.sort_order.asc())
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# ── Full Menu (Public) ────────────────────────────────

async def get_full_menu(db: AsyncSession, menu_id: UUID) -> Optional[Menu]:
    """Get a complete menu with all categories and items (for public display)."""
    stmt = (
        select(Menu)
        .where(Menu.id == menu_id, Menu.is_active == True)
        .options(
            selectinload(Menu.categories).selectinload(Category.items)
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
