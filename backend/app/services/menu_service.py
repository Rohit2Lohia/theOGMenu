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

async def get_full_public_data(db: AsyncSession, slug: str) -> Optional[dict]:
    """
    Get a complete snapshot of a restaurant's public menu, 
    including restaurant info and gallery, for a single fast load.
    """
    from app.services import restaurant_service
    from app.models.category import Category # already imported at top
    from app.models.gallery import GalleryImage

    restaurant = await restaurant_service.get_restaurant_by_slug(db, slug)
    if not restaurant:
        return None
    
    # 1. Get Active Menu with categories & items
    active_menu = await get_active_menu_for_restaurant(db, restaurant.id)
    if not active_menu:
        return None
    
    full_menu = await get_full_menu(db, active_menu.id)
    
    # 2. Get Gallery
    stmt_gallery = select(GalleryImage).where(GalleryImage.restaurant_id == restaurant.id)
    gallery_result = await db.execute(stmt_gallery)
    gallery = list(gallery_result.scalars().all())

    return {
        "id": active_menu.id,
        "name": active_menu.name,
        "restaurant": {
            "id": restaurant.id,
            "name": restaurant.name,
            "logo_url": restaurant.logo_url,
            "cover_url": restaurant.cover_url,
            "description": restaurant.description,
            "address": restaurant.address,
            "google_maps_url": restaurant.google_maps_url,
            "phone_number": restaurant.phone_number,
            "opening_hours": restaurant.opening_hours,
            "whatsapp_number": restaurant.whatsapp_number,
            "instagram_url": restaurant.instagram_url,
            "facebook_url": restaurant.facebook_url,
            "brand_accent_color": restaurant.brand_accent_color,
            "our_story": restaurant.our_story
        } if restaurant else None,
        "categories": [
            {
                "id": cat.id,
                "name": cat.name,
                "icon": cat.icon,
                "items": [
                    {
                        "id": item.id,
                        "name": item.name,
                        "description": item.description,
                        "price": item.price,
                        "food_type": item.food_type,
                        "is_available": item.is_available,
                        "is_bestseller": item.is_bestseller,
                        "is_spicy": item.is_spicy,
                        "calories": item.calories,
                        "tags": item.tags,
                        "image_url": item.image_url
                    }
                    for item in cat.items if item.is_available
                ]
            }
            for cat in full_menu.categories if cat.is_active
        ] if full_menu else [],
        "gallery": [
            {
                "id": img.id,
                "url": img.url,
                "caption": img.caption,
                "category": img.category
            }
            for img in gallery
        ]
    }
