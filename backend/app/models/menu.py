"""
Menu model — a restaurant can have multiple menus (Lunch, Dinner, etc.)
"""

from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Menu(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menus"

    restaurant_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menus")
    categories = relationship(
        "Category", back_populates="menu", lazy="selectin", cascade="all, delete-orphan",
        order_by="Category.sort_order"
    )
    qr_codes = relationship("QRCode", back_populates="menu", lazy="selectin")

    def __repr__(self):
        return f"<Menu {self.name}>"
