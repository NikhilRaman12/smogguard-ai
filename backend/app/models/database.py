"""
SmogGuard AI — SQLAlchemy Async Database Models

Defines all ORM models, engine/session factories, and the database
initialisation routine for the async PostgreSQL backend.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import AsyncGenerator

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, relationship

from app.config import get_settings

# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------


class User(Base):
    """Registered user of SmogGuard AI."""

    __tablename__ = "users"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: str = Column(String(320), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(256), nullable=False)
    name: str = Column(String(128), nullable=False)
    latitude: float = Column(Float, nullable=True)
    longitude: float = Column(Float, nullable=True)
    city: str = Column(String(128), nullable=True)
    country: str = Column(String(128), nullable=True)
    health_conditions: dict | None = Column(JSON, nullable=True)
    family_members: list | None = Column(JSON, nullable=True)
    home_type: str = Column(String(64), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    daily_routines = relationship("DailyRoutine", back_populates="user", cascade="all, delete-orphan")
    impact_logs = relationship("ImpactLog", back_populates="user", cascade="all, delete-orphan")
    alert_preference = relationship("AlertPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class AQIReading(Base):
    """Stored air-quality reading from an external API."""

    __tablename__ = "aqi_readings"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city: str = Column(String(128), nullable=False, index=True)
    latitude: float = Column(Float, nullable=True)
    longitude: float = Column(Float, nullable=True)
    aqi: int = Column(Integer, nullable=False)
    pm25: float = Column(Float, nullable=True)
    pm10: float = Column(Float, nullable=True)
    no2: float = Column(Float, nullable=True)
    so2: float = Column(Float, nullable=True)
    o3: float = Column(Float, nullable=True)
    co: float = Column(Float, nullable=True)
    dominant_pollutant: str = Column(String(32), nullable=True)
    source: str = Column(String(128), nullable=True)
    temperature: float = Column(Float, nullable=True)
    humidity: float = Column(Float, nullable=True)
    wind_speed: float = Column(Float, nullable=True)
    recorded_at: datetime = Column(DateTime(timezone=True), server_default=func.now())


class Conversation(Base):
    """A chat conversation between a user and SmogGuard AI."""

    __tablename__ = "conversations"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: str = Column(String(256), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    """A single message within a conversation."""

    __tablename__ = "messages"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: uuid.UUID = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role: str = Column(String(16), nullable=False)  # user / assistant / system / tool
    content: str = Column(Text, nullable=True)
    tool_calls: dict | None = Column(JSON, nullable=True)
    metadata_: dict | None = Column("metadata", JSON, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


class DailyRoutine(Base):
    """AI-generated daily routine plan for a user."""

    __tablename__ = "daily_routines"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_date: date = Column(Date, nullable=False)
    routine_data: dict = Column(JSON, nullable=False)
    estimated_emission_reduction_pct: int = Column(Integer, nullable=True)
    aqi_at_generation: int = Column(Integer, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="daily_routines")


class ImpactLog(Base):
    """User-logged environmental impact action."""

    __tablename__ = "impact_logs"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type: str = Column(String(64), nullable=False)
    description: str = Column(Text, nullable=True)
    co2_saved_kg: float = Column(Float, default=0.0)
    pm25_avoided_ug: float = Column(Float, default=0.0)
    logged_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="impact_logs")


class AlertPreference(Base):
    """User alert preferences for AQI thresholds."""

    __tablename__ = "alert_preferences"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    aqi_threshold: int = Column(Integer, default=150)
    email_alerts: bool = Column(Boolean, default=True)
    push_alerts: bool = Column(Boolean, default=False)
    quiet_hours: dict | None = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", back_populates="alert_preference")


# ---------------------------------------------------------------------------
# Async engine & session factory
# ---------------------------------------------------------------------------

_settings = get_settings()

engine = create_async_engine(
    _settings.DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session.

    Usage::

        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables defined on :class:`Base` (idempotent).

    Called once during application startup via the lifespan context manager.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
