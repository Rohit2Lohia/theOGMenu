"""
Item model — individual food/drink items in a category.
"""

from decimal import Decimal

from sqlalchemy import String, Boolean, Integer, Numeric, Text, ForeignKey
from sqlalchemy import Uuid as UUID, JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Item(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "items"

    category_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_translations: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_translations: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )
    discounted_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    food_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="veg"
    )  # veg | non-veg | egg | vegan
    is_bestseller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_spicy: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tags: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    allergens: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    variants: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )  # {"Half": 150, "Full": 280}
    addons: Mapped[list | None] = mapped_column(
        JSONB, nullable=True, default=list
    )  # [{"name": "Extra Cheese", "price": 30}]
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="items")

    def __repr__(self):
        return f"<Item {self.name} ₹{self.price}>"
