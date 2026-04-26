"""
theOGMenu Backend Configuration
Loads environment variables with validation via Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, model_validator
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "theOGMenu"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    DATABASE_URL: str = Field(
        default="mysql+aiomysql://root:password@localhost/theogmenu",
        description="Async MySQL connection string (mysql+aiomysql://user:pass@host/db)"
    )

    # JWT
    JWT_SECRET_KEY: str = Field(
        default="change-me-in-production",
        description="Secret key for JWT token signing"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @model_validator(mode="after")
    def validate_settings(self):
        """Validate critical settings at startup."""
        # Warn on insecure JWT secret
        if self.JWT_SECRET_KEY == "change-me-in-production" and not self.DEBUG:
            import warnings
            warnings.warn(
                "⚠️  JWT_SECRET_KEY is using the default insecure value! "
                "Set a strong secret in your .env file. "
                "This will be a fatal error in production.",
                stacklevel=2,
            )

        # Refuse to use SQLite outside of an explicit test/dev context
        if self.DATABASE_URL.startswith("sqlite") and not self.DEBUG:
            raise ValueError(
                "SQLite is not allowed in production (DEBUG=False). "
                "Set DATABASE_URL to a MySQL connection string in your .env file."
            )

        return self

    # Firebase
    FIREBASE_PROJECT_ID: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
