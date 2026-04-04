"""
Gallery Image model.
"""

from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class GalleryImage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gallery_images"

    restaurant_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    public_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    caption: Mapped[str | None] = mapped_column(String(200), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="food", nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="gallery_images")

    def __repr__(self):
        return f"<GalleryImage {self.id}>"
