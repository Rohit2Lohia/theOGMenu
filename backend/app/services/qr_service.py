"""
QR Code service — generation and management.
"""

import io
from typing import Optional
from uuid import UUID

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from PIL import Image

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.qr_code import QRCode
from app.models.restaurant import Restaurant
from app.config import settings

# ReportLab for PDF generation
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader


def generate_qr_image(
    url: str,
    fg_color: str = "#000000",
    bg_color: str = "#FFFFFF",
    box_size: int = 10,
    border: int = 4,
) -> bytes:
    """
    Generate a styled QR code image.
    Returns the image as PNG bytes.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        fill_color=fg_color,
        back_color=bg_color,
    )

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()


async def get_or_create_qr_code(
    db: AsyncSession,
    restaurant_id: UUID,
) -> QRCode:
    """Get existing QR code for a restaurant or create the stable one."""
    stmt = select(QRCode).where(
        (QRCode.restaurant_id == restaurant_id) & (QRCode.menu_id.is_(None))
    )
    result = await db.execute(stmt)
    qr = result.scalars().first()
    
    if qr:
        return qr

    # Need restaurant slug for the stable URL
    stmt_rest = select(Restaurant).where(Restaurant.id == restaurant_id)
    result_rest = await db.execute(stmt_rest)
    restaurant = result_rest.scalars().first()
    
    if not restaurant:
        raise ValueError("Restaurant not found")

    # Stable URL: /en/r/slug
    target_url = f"{settings.FRONTEND_URL}/en/r/{restaurant.slug}"

    qr = QRCode(
        restaurant_id=restaurant_id,
        label="Main",
        target_url=target_url,
        style_config={
            "fg_color": "#000000",
            "bg_color": "#FFFFFF",
            "embed_logo": True,
        },
        scan_count=0,
    )
    db.add(qr)
    await db.flush()
    await db.refresh(qr)
    return qr


async def generate_qr_pdf(
    qr: QRCode,
    restaurant_name: str,
    template: str = "plain",
    custom_text: Optional[str] = None
) -> bytes:
    """
    Generate a high-resolution A4 PDF for the QR code.
    Templates: plain, with_name, with_custom
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Generate QR image bytes
    fg_color = qr.style_config.get("fg_color", "#000000")
    bg_color = qr.style_config.get("bg_color", "#FFFFFF")
    qr_bytes = generate_qr_image(qr.target_url, fg_color, bg_color, box_size=20)
    
    qr_img = Image.open(io.BytesIO(qr_bytes))
    qr_reader = ImageReader(qr_img)

    qr_size = 4 * inch
    x_centered = (width - qr_size) / 2
    y_centered = (height - qr_size) / 2

    if template == "with_name":
        # Header: Restaurant Name
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(width / 2, height - 1.5 * inch, restaurant_name)
        
        # QR Code in middle
        c.drawImage(qr_reader, x_centered, y_centered, width=qr_size, height=qr_size)
        
        # Footer: URL
        c.setFont("Helvetica", 14)
        c.drawCentredString(width / 2, 1.5 * inch, f"Scan to view menu: {qr.target_url}")

    elif template == "with_custom":
        # Header: Restaurant Name
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(width / 2, height - 1.5 * inch, restaurant_name)
        
        # QR Code in middle
        c.drawImage(qr_reader, x_centered, y_centered, width=qr_size, height=qr_size)
        
        # Footer: Custom Text
        if custom_text:
            c.setFont("Helvetica-Bold", 24)
            c.drawCentredString(width / 2, 1.8 * inch, custom_text)
            
        c.setFont("Helvetica", 12)
        c.drawCentredString(width / 2, 1.2 * inch, qr.target_url)

    else:  # plain
        c.drawImage(qr_reader, x_centered, y_centered, width=qr_size, height=qr_size)

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()


async def get_qr_codes(
    db: AsyncSession, restaurant_id: UUID
) -> list[QRCode]:
    """Get all QR codes for a restaurant."""
    stmt = (
        select(QRCode)
        .where(QRCode.restaurant_id == restaurant_id)
        .order_by(QRCode.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def increment_scan_count(
    db: AsyncSession, qr_code_id: UUID
) -> Optional[QRCode]:
    """Increment the scan count for a QR code."""
    stmt = select(QRCode).where(QRCode.id == qr_code_id)
    result = await db.execute(stmt)
    qr = result.scalars().first()
    if qr:
        qr.scan_count += 1
        await db.flush()
    return qr
