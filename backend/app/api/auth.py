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


async def _resolve_user_from_token(token: str, db: AsyncSession) -> User | None:
    """Decode JWT token and load the corresponding User if valid."""
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    user_id: str | None = payload.get("sub")
    if not user_id:
        return None
    try:
        uid: uuid.UUID | str = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except (ValueError, TypeError):
        uid = user_id
    res = await db.execute(select(User).where(User.id == uid))
    return res.scalar_one_or_none()


async def _get_or_create_demo_user(db: AsyncSession) -> User:
    """Return the isolated demo sandbox user, creating it on first access."""
    res = await db.execute(select(User).where(User.email == "demo@smogguard.ai"))
    demo_user = res.scalar_one_or_none()
    if demo_user:
        return demo_user

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
            user = await _resolve_user_from_token(token, db)
            if user:
                return user
        except JWTError:
            if not settings.demo_mode:
                raise credentials_exception

    if settings.demo_mode:
        return await _get_or_create_demo_user(db)

    raise credentials_exception
