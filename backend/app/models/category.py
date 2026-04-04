"""
Category model — groups menu items (Starters, Main Course, Desserts, etc.)
"""

from sqlalchemy import String, Boolean, Integer, Text, ForeignKey
from sqlalchemy import Uuid as UUID, JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    menu_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("menus.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_translations: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    menu = relationship("Menu", back_populates="categories")
    items = relationship(
        "Item", back_populates="category", lazy="selectin", cascade="all, delete-orphan",
        order_by="Item.sort_order"
    )

    def __repr__(self):
        return f"<Category {self.name}>"
