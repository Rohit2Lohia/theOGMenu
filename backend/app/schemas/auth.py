"""
Auth schemas — request/response DTOs for authentication.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class FirebaseTokenRequest(BaseModel):
    """Client sends Firebase ID token after phone OTP verification."""
    firebase_token: str = Field(..., description="Firebase ID token from client SDK")


class TokenResponse(BaseModel):
    """JWT tokens returned after successful authentication."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    is_new_user: bool = False


class RefreshTokenRequest(BaseModel):
    """Request to refresh an access token."""
    refresh_token: str


class UserProfileUpdate(BaseModel):
    """Update user profile (name, etc.)."""
    name: Optional[str] = Field(None, max_length=255)


class UserResponse(BaseModel):
    """User data returned in API responses."""
    id: UUID
    phone_number: str
    name: Optional[str] = None

    model_config = {"from_attributes": True}
