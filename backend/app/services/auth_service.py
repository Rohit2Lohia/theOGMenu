"""
Auth service — handles Firebase token verification and user creation.
"""

from typing import Optional
from uuid import UUID

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.utils.security import create_access_token, create_refresh_token, verify_token


# Initialize Firebase Admin SDK
_firebase_app = None


def init_firebase():
    """Initialize Firebase Admin SDK (called once at startup)."""
    global _firebase_app
    if _firebase_app is not None:
        return

    try:
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
            _firebase_app = firebase_admin.initialize_app(cred)
        elif settings.FIREBASE_PROJECT_ID:
            # Use Application Default Credentials (for Railway/Cloud deployments)
            _firebase_app = firebase_admin.initialize_app(options={
                "projectId": settings.FIREBASE_PROJECT_ID,
            })
        else:
            print("⚠️  Firebase not configured — auth will use development mode")
    except Exception as e:
        print(f"⚠️  Firebase initialization error: {e}")


def verify_firebase_token(id_token: str) -> Optional[dict]:
    """
    Verify a Firebase ID token.
    Returns decoded token with 'uid', 'phone_number', etc.
    In development mode without Firebase config, accepts a mock token.
    """
    if _firebase_app is None:
        # Development mode — accept mock tokens
        if id_token.startswith("dev_"):
            parts = id_token.split("_")
            return {
                "uid": f"dev_uid_{parts[1] if len(parts) > 1 else 'test'}",
                "phone_number": f"+91{parts[1] if len(parts) > 1 else '9999999999'}",
            }
        return None

    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None


async def authenticate_with_firebase(
    db: AsyncSession, firebase_token: str
) -> tuple[User, bool]:
    """
    Authenticate a user with their Firebase ID token.
    Creates a new user if one doesn't exist.
    Returns (user, is_new_user).
    """
    decoded = verify_firebase_token(firebase_token)
    if not decoded:
        raise ValueError("Invalid Firebase token")

    firebase_uid = decoded["uid"]
    phone_number = decoded.get("phone_number", "")

    # Check if user exists
    stmt = select(User).where(User.firebase_uid == firebase_uid)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user:
        return user, False

    # Create new user
    user = User(
        firebase_uid=firebase_uid,
        phone_number=phone_number,
    )
    db.add(user)
    await db.flush()
    return user, True


def generate_tokens(user_id: UUID) -> dict:
    """Generate access and refresh tokens for a user."""
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get a user by their ID."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()
