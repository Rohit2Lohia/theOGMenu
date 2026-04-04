"""
Menu, Category, and Item API routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.menu import (
    MenuCreate, MenuUpdate, MenuResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ItemCreate, ItemUpdate, ItemResponse,
)
from app.services import menu_service

router = APIRouter(tags=["Menus"])


# ── Menus ─────────────────────────────────────────────

@router.get(
    "/restaurants/{restaurant_id}/menus",
    response_model=list[MenuResponse],
    tags=["Menus"],
)
async def list_menus(
    restaurant_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.get_menus_by_restaurant(db, restaurant_id)


@router.post(
    "/restaurants/{restaurant_id}/menus",
    response_model=MenuResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Menus"],
)
async def create_menu(
    restaurant_id: UUID,
    data: MenuCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.create_menu(db, restaurant_id, data)


@router.patch("/menus/{menu_id}", response_model=MenuResponse, tags=["Menus"])
async def update_menu(
    menu_id: UUID,
    data: MenuUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    menu = await menu_service.update_menu(db, menu_id, data)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu


@router.delete("/menus/{menu_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Menus"])
async def delete_menu(
    menu_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await menu_service.delete_menu(db, menu_id):
        raise HTTPException(status_code=404, detail="Menu not found")


# ── Categories ────────────────────────────────────────

@router.get(
    "/menus/{menu_id}/categories",
    response_model=list[CategoryResponse],
    tags=["Categories"],
)
async def list_categories(
    menu_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.get_categories_by_menu(db, menu_id)


@router.post(
    "/menus/{menu_id}/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Categories"],
)
async def create_category(
    menu_id: UUID,
    data: CategoryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.create_category(db, menu_id, data)


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    tags=["Categories"],
)
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    category = await menu_service.update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Categories"],
)
async def delete_category(
    category_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await menu_service.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")


# ── Items ─────────────────────────────────────────────

@router.get(
    "/categories/{category_id}/items",
    response_model=list[ItemResponse],
    tags=["Items"],
)
async def list_items(
    category_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.get_items_by_category(db, category_id)


@router.post(
    "/categories/{category_id}/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Items"],
)
async def create_item(
    category_id: UUID,
    data: ItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await menu_service.create_item(db, category_id, data)


@router.patch("/items/{item_id}", response_model=ItemResponse, tags=["Items"])
async def update_item(
    item_id: UUID,
    data: ItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = await menu_service.update_item(db, item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Items"],
)
async def delete_item(
    item_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await menu_service.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")


@router.patch(
    "/items/{item_id}/toggle-availability",
    response_model=ItemResponse,
    tags=["Items"],
)
async def toggle_item_availability(
    item_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Quick toggle for item availability."""
    item = await menu_service.toggle_item_availability(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# ── Public Endpoints ───────────────────────────────────

@router.get(
    "/public/menus/{menu_id}",
    response_model=dict,  # Simplified for POC, could create a FullMenuResponse schema
    tags=["Public"],
)
async def get_public_menu(
    menu_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint to get the entire menu structured (no auth required)."""
    menu = await menu_service.get_full_menu(db, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Manually serialize it cleanly for the frontend
    return {
        "id": str(menu.id),
        "name": menu.name,
        "restaurant_id": str(menu.restaurant_id),
        "categories": [
            {
                "id": str(cat.id),
                "name": cat.name,
                "icon": cat.icon,
                "items": [
                    {
                        "id": str(item.id),
                        "name": item.name,
                        "description": item.description,
                        "price": item.price,
                        "food_type": item.food_type,
                        "is_available": item.is_available,
                        "is_bestseller": item.is_bestseller,
                        "is_spicy": item.is_spicy,
                        "calories": item.calories,
                        "tags": item.tags
                    }
                    for item in cat.items if item.is_available
                ]
            }
            for cat in menu.categories 
            if cat.is_active and any(item.is_available for item in cat.items)
        ]
    }


@router.get(
    "/public/restaurant/{slug}/menu",
    response_model=dict,
    tags=["Public"],
)
async def get_stable_public_menu(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Stable public endpoint that resolves the current 'active' menu for a restaurant
    by its slug. Used for permanent QR codes.
    """
    from app.services import restaurant_service
    
    restaurant = await restaurant_service.get_restaurant_by_slug(db, slug)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    menu = await menu_service.get_active_menu_for_restaurant(db, restaurant.id)
    if not menu:
        raise HTTPException(status_code=404, detail="Active menu not found for this restaurant")
    
    # Delegate to the full menu logic
    full_menu = await menu_service.get_full_menu(db, menu.id)
    if not full_menu:
        raise HTTPException(status_code=404, detail="Full menu data not found")

    # Reuse serialization logic
    return {
        "id": str(full_menu.id),
        "name": full_menu.name,
        "restaurant_id": str(full_menu.restaurant_id),
        "categories": [
            {
                "id": str(cat.id),
                "name": cat.name,
                "icon": cat.icon,
                "items": [
                    {
                        "id": str(item.id),
                        "name": item.name,
                        "description": item.description,
                        "price": item.price,
                        "food_type": item.food_type,
                        "is_available": item.is_available,
                        "is_bestseller": item.is_bestseller,
                        "is_spicy": item.is_spicy,
                        "calories": item.calories,
                        "tags": item.tags
                    }
                    for item in cat.items if item.is_available
                ]
            }
            for cat in full_menu.categories 
            if cat.is_active and any(item.is_available for item in cat.items)
        ]
    }
