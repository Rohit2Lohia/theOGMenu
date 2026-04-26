"""
QRCode model.
"""

from sqlalchemy import String, Integer, ForeignKey, JSON, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class QRCode(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "qr_codes"

    restaurant_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    menu_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menus.id", ondelete="SET NULL"), nullable=True
    )
    label: Mapped[str] = mapped_column(String(100), default="Main", nullable=False)
    target_url: Mapped[str] = mapped_column(Text, nullable=False)
    style_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    scan_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="qr_codes")
    menu = relationship("Menu", back_populates="qr_codes")

    def __repr__(self):
        return f"<QRCode {self.label}>"
