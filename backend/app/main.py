"""
theOGMenu — FastAPI Application Entrypoint
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
import app.models  # Preload models to satisfy SQLAlchemy relationships
from app.services.auth_service import init_firebase
from app.utils.cloudinary_utils import configure_cloudinary

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.restaurants import router as restaurants_router
from app.api.v1.menus import router as menus_router
from app.api.v1.gallery import router as gallery_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.qr import router as qr_router
from app.api.v1.tier import router as tier_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME}...")
    init_firebase()
    configure_cloudinary()
    print(f"✅ {settings.APP_NAME} is ready!")
    yield
    # Shutdown
    print(f"👋 Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="QR Digital Menu Platform for Indian Restaurants",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(restaurants_router, prefix=API_PREFIX)
app.include_router(menus_router, prefix=API_PREFIX)
app.include_router(gallery_router, prefix=API_PREFIX)
app.include_router(reviews_router, prefix=API_PREFIX)
app.include_router(qr_router, prefix=API_PREFIX)
app.include_router(tier_router, prefix=API_PREFIX)


# Global Exception Handler
from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions globally, log them, and hide stack traces from the client."""
    logger.error(f"Unhandled Exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."},
    )



@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
