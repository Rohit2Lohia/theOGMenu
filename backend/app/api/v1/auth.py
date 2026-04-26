"""
Auth API routes — phone OTP authentication via Firebase.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    FirebaseTokenRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileUpdate,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_with_firebase,
    generate_tokens,
    get_user_by_id,
)
from app.utils.security import verify_token
from fastapi import Request
from app.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login_with_firebase(
    request: Request,
    body: FirebaseTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a Firebase ID token for JWT access + refresh tokens.
    Creates a new user account if one doesn't exist.
    """
    try:
        user, is_new = await authenticate_with_firebase(db, body.firebase_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    tokens = generate_tokens(user.id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user_id=user.id,
        is_new_user=is_new,
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh_access_token(
    request: Request,
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a refresh token for a new access + refresh token pair."""
    from uuid import UUID

    payload = verify_token(body.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = UUID(payload["sub"])
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    tokens = generate_tokens(user.id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user_id=user.id,
        is_new_user=False,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    user: User = Depends(get_current_user),
):
    """Get the current logged-in user's profile."""
    return user


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    data: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile (e.g., set name after first login)."""
    if data.name is not None:
        user.name = data.name
    await db.flush()
    return user
