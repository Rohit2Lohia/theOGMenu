"""
QR Code API routes.
"""

from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.qr_code import QRCodeCreate, QRCodeResponse
from app.services import qr_service, restaurant_service

router = APIRouter(tags=["QR Codes"])

@router.get("/restaurants/{restaurant_id}/qr", response_model=List[QRCodeResponse])
async def get_restaurant_qr_codes(
    restaurant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all QR codes for a restaurant."""
    restaurant = await restaurant_service.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")
        
    return await qr_service.get_qr_codes(db, restaurant_id)

@router.post(
    "/restaurants/{restaurant_id}/qr",
    response_model=QRCodeResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_qr_code(
    restaurant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get existing QR or create a new stable QR Code for a restaurant."""
    restaurant = await restaurant_service.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your restaurant")
        
    qr = await qr_service.get_or_create_qr_code(
        db=db,
        restaurant_id=restaurant_id,
    )
    return qr

@router.get("/qr/{qr_id}/image")
async def download_qr_image(
    qr_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Download the actual PNG image for a given QR code."""
    from sqlalchemy import select
    from app.models.qr_code import QRCode
    
    stmt = select(QRCode).where(QRCode.id == qr_id)
    result = await db.execute(stmt)
    qr = result.scalar_one_or_none()
    if not qr:
        raise HTTPException(status_code=404, detail="QR Code not found")
        
    fg_color = qr.style_config.get("fg_color", "#000000")
    bg_color = qr.style_config.get("bg_color", "#FFFFFF")
    
    img_bytes = qr_service.generate_qr_image(
        url=qr.target_url,
        fg_color=fg_color,
        bg_color=bg_color
    )
    
    return Response(content=img_bytes, media_type="image/png")

@router.get("/qr/{qr_id}/pdf")
async def download_qr_pdf(
    qr_id: UUID,
    template: str = Query("plain", pattern="^(plain|with_name|with_custom)$"),
    custom_text: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Download a high-resolution PDF for the QR code."""
    from sqlalchemy import select
    from app.models.qr_code import QRCode
    from app.models.restaurant import Restaurant
    
    stmt = select(QRCode).where(QRCode.id == qr_id)
    result = await db.execute(stmt)
    qr = result.scalar_one_or_none()
    if not qr:
        raise HTTPException(status_code=404, detail="QR Code not found")
        
    # Need restaurant name for the PDF
    stmt_rest = select(Restaurant).where(Restaurant.id == qr.restaurant_id)
    result_rest = await db.execute(stmt_rest)
    restaurant = result_rest.scalar_one_or_none()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    pdf_bytes = await qr_service.generate_qr_pdf(
        qr=qr,
        restaurant_name=restaurant.name,
        template=template,
        custom_text=custom_text
    )
    
    filename = f"qrcode_{restaurant.slug}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
