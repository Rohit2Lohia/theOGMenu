"""
Review service — business logic for customer reviews.
Placeholder for Phase 5 implementation.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import CustomerReview


async def get_reviews(
    db: AsyncSession,
    restaurant_id: UUID,
    approved_only: bool = True,
) -> list[CustomerReview]:
    """Get reviews for a restaurant."""
    stmt = (
        select(CustomerReview)
        .where(CustomerReview.restaurant_id == restaurant_id)
        .order_by(CustomerReview.created_at.desc())
    )
    if approved_only:
        stmt = stmt.where(CustomerReview.is_approved == True)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_review(
    db: AsyncSession,
    restaurant_id: UUID,
    customer_name: str,
    rating: int,
    comment: Optional[str] = None,
) -> CustomerReview:
    """Submit a new customer review (pending approval)."""
    review = CustomerReview(
        restaurant_id=restaurant_id,
        customer_name=customer_name,
        rating=rating,
        comment=comment,
        is_approved=False,
    )
    db.add(review)
    await db.flush()
    return review


async def moderate_review(
    db: AsyncSession, review_id: UUID, is_approved: bool
) -> Optional[CustomerReview]:
    """Approve or reject a review."""
    stmt = select(CustomerReview).where(CustomerReview.id == review_id)
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()
    if not review:
        return None
    review.is_approved = is_approved
    await db.flush()
    return review
