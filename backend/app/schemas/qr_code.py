"""
QR Code schemas.
"""

from typing import Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class QRCodeStyleConfig(BaseModel):
    fg_color: str = "#000000"
    bg_color: str = "#FFFFFF"
    embed_logo: bool = True


class QRCodeCreate(BaseModel):
    label: str = "Main"
    menu_id: Optional[UUID] = None
    style_config: Optional[QRCodeStyleConfig] = None


class QRCodeResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    menu_id: Optional[UUID] = None
    label: str
    target_url: str
    style_config: Dict[str, Any]
    scan_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
