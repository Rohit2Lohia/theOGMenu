"""
Review model.
"""

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"

    restaurant_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reviews")

    def __repr__(self):
        return f"<Review {self.customer_name} - {self.rating}>"
