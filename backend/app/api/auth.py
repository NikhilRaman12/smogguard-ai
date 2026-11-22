"""
SmogGuard AI — Authentication & Security Utilities
JWT token issuing and validation, password hashing via bcrypt.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.database import User, get_db

logger = logging.getLogger(__name__)
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    """Hash plaintext password with bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Encode JWT token with expiration timestamp."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency to extract authenticated user or use explicit demo mode."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token:
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            user_id: str = payload.get("sub")
            if user_id:
                try:
                    uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
                except (ValueError, TypeError):
                    uid = user_id
                query = select(User).where(User.id == uid)
                res = await db.execute(query)
                user = res.scalar_one_or_none()
                if user:
                    return user
        except JWTError:
            if not settings.demo_mode:
                raise credentials_exception

    # If in DEMO MODE (default for review and local evaluation), allow deterministic isolated demo user
    if settings.demo_mode:
        query = select(User).where(User.email == "demo@smogguard.ai")
        res = await db.execute(query)
        demo_user = res.scalar_one_or_none()
        if demo_user:
            return demo_user

        # Create demo user
        default_user = User(
            email="demo@smogguard.ai",
            password_hash=hash_password("DemoPassword123!"),
            name="Urban Eco Resident",
            city="Delhi",
            country="India",
            home_type="Apartment",
            health_conditions={"asthma": True, "allergies": True},
            family_members=[{"is_child": True}, {"is_elderly": False}],
        )
        db.add(default_user)
        await db.commit()
        await db.refresh(default_user)
        return default_user

    raise credentials_exception
