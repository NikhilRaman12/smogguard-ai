"""
SmogGuard AI — Production FastAPI Application Entrypoint
Configures CORS, lifespan events (database auto-migration), and routes.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.config import get_settings
from app.models.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("smogguard")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager to initialize database schema on startup with fail-fast validation in production."""
    logger.info("Starting SmogGuard AI backend services...")
    try:
        await init_db()
        logger.info("Database schema initialized successfully.")
    except Exception as exc:
        logger.error(f"Database initialization error: {exc}")
        # In strict non-demo production mode, abort startup if database is unreachable
        if not settings.demo_mode:
            raise RuntimeError(f"Database initialization failed in production mode: {exc}") from exc
    yield
    logger.info("Shutting down SmogGuard AI backend services.")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="GenAI-Powered Air Quality & Winter Smog Intelligence Platform",
    lifespan=lifespan,
)

# CORS configuration for cross-origin development and production Cloud Run domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Health check endpoint for Docker and Cloud Run probes."""
    return {"status": "healthy", "service": "SmogGuard AI Backend"}


@app.get("/", tags=["system"])
async def root() -> dict[str, str]:
    """Root info endpoint."""
    return {
        "service": "SmogGuard AI",
        "version": "1.0.0",
        "docs": "/docs",
        "realtime_aqi": "/api/v1/aqi/current",
    }
