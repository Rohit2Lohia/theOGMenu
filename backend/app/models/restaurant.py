"""
Restaurant model.
"""

from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Restaurant(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "restaurants"

    owner_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    google_maps_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # New Enhanced Profile Fields
    our_story: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    facebook_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    opening_hours: Mapped[str | None] = mapped_column(Text, nullable=True)
    brand_accent_color: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="restaurants")
    menus = relationship("Menu", back_populates="restaurant", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    gallery_images = relationship("GalleryImage", back_populates="restaurant", cascade="all, delete-orphan")
    qr_codes = relationship("QRCode", back_populates="restaurant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Restaurant {self.name}>"
