"""
SmogGuard AI (UrbanGuard India) — SQLAlchemy Async Database Models

Defines all ORM models for personal, municipal, and commercial environmental intelligence:
- Users & Organizations (Municipalities, Estates, Campuses, Hospitals, Citizens)
- Multi-domain environmental observations (Air/CAAQMS, Water/CPCB/India-WRIS, Noise, Heat, Waste, Micro-Sensors)
- Ward/Zonal Geospatial Boundaries & Spatial Hotspots
- Evidence-grounded Intervention Plans & Scenario Models
- AI Conversations & Action Ledgers
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
# Organizations & Users
# ---------------------------------------------------------------------------


class Organization(Base):
    """Municipal Corporation, Commercial Real Estate, Industrial Campus, or Healthcare Network."""
    __tablename__ = "organizations"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: str = Column(String(256), nullable=False)
    org_type: str = Column(String(64), nullable=False, default="municipality")  # municipality | industry | real_estate | hospital | campus | ngo
    city: str = Column(String(128), nullable=False, index=True)
    state: str = Column(String(128), nullable=False, default="Telangana")
    jurisdiction_code: str = Column(String(64), nullable=True)  # e.g., GHMC, HMDA, BBMP, CPCB-ZONAL
    settings: dict | None = Column(JSON, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="organization")
    wards = relationship("MunicipalWard", back_populates="organization")
    interventions = relationship("InterventionPlan", back_populates="organization")


class User(Base):
    """Registered user of SmogGuard AI / UrbanGuard."""
    __tablename__ = "users"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: uuid.UUID | None = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    email: str = Column(String(320), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(256), nullable=False)
    name: str = Column(String(128), nullable=False)
    role: str = Column(String(64), nullable=False, default="citizen")  # citizen | municipal_officer | industrial_auditor | campus_facility_mgr
    latitude: float = Column(Float, nullable=True)
    longitude: float = Column(Float, nullable=True)
    city: str = Column(String(128), nullable=True, default="Hyderabad")
    neighborhood: str = Column(String(128), nullable=True, default="Gachibowli")
    ward_number: int | None = Column(Integer, nullable=True)
    country: str = Column(String(128), nullable=True, default="India")
    health_conditions: dict | None = Column(JSON, nullable=True)
    family_members: list | None = Column(JSON, nullable=True)
    home_type: str = Column(String(64), nullable=True, default="Apartment")
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="users")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    daily_routines = relationship("DailyRoutine", back_populates="user", cascade="all, delete-orphan")
    impact_logs = relationship("ImpactLog", back_populates="user", cascade="all, delete-orphan")
    alert_preference = relationship("AlertPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Geospatial Municipal Boundaries & Hotspots
# ---------------------------------------------------------------------------

class MunicipalWard(Base):
    """Administrative Ward / Zone for city monitoring (e.g. GHMC Ward 104, BBMP, NDMC)."""
    __tablename__ = "municipal_wards"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: uuid.UUID | None = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    ward_number: int = Column(Integer, nullable=False, index=True)
    ward_name: str = Column(String(128), nullable=False)
    zone_name: str = Column(String(128), nullable=False)  # e.g., Serilingampally, Charminar, Kukatpally
    city: str = Column(String(128), nullable=False, index=True)
    centroid_lat: float = Column(Float, nullable=False)
    centroid_lng: float = Column(Float, nullable=False)
    boundary_geojson: dict | None = Column(JSON, nullable=True)
    population_density_sqkm: float | None = Column(Float, nullable=True)
    vulnerability_index: float | None = Column(Float, nullable=True)  # 0.0 - 1.0 composite vulnerability
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="wards")
    environmental_hotspots = relationship("EnvironmentalHotspot", back_populates="ward")


class EnvironmentalHotspot(Base):
    """Identified localized environmental hazard zone (e.g., C&D dust corridor, industrial outfall)."""
    __tablename__ = "environmental_hotspots"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ward_id: uuid.UUID | None = Column(UUID(as_uuid=True), ForeignKey("municipal_wards.id", ondelete="CASCADE"), nullable=True)
    city: str = Column(String(128), nullable=False, index=True)
    location_name: str = Column(String(128), nullable=False)
    domain: str = Column(String(64), nullable=False, default="air")  # air | water | noise | waste | heat
    severity: str = Column(String(32), nullable=False, default="critical")  # critical | high | moderate
    latitude: float = Column(Float, nullable=False)
    longitude: float = Column(Float, nullable=False)
    primary_pollutant: str = Column(String(64), nullable=False, default="PM2.5")
    observed_value: float = Column(Float, nullable=False)
    regulatory_limit: float = Column(Float, nullable=False)
    probable_source: str = Column(String(256), nullable=False)  # e.g., Construction demolition dust resuspension / Diesel generator cluster
    status: str = Column(String(32), nullable=False, default="active")  # active | mitigated | under_investigation
    identified_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ward = relationship("MunicipalWard", back_populates="environmental_hotspots")


# ---------------------------------------------------------------------------
# Multi-Domain Environmental Observations (Air, Water, Heat, Noise)
# ---------------------------------------------------------------------------

class AQIReading(Base):
    """Stored air-quality reading from an external CAAQMS / CPCB / WAQI station."""
    __tablename__ = "aqi_readings"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city: str = Column(String(128), nullable=False, index=True)
    station_name: str = Column(String(256), nullable=True)
    station_id: str = Column(String(128), nullable=True, index=True)  # e.g. CPCB-TS001
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
    data_status: str = Column(String(32), nullable=False, default="live")  # live | cached | estimated | simulated
    confidence_score: float = Column(Float, nullable=False, default=0.95)
    temperature: float = Column(Float, nullable=True)
    humidity: float = Column(Float, nullable=True)
    wind_speed: float = Column(Float, nullable=True)
    recorded_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class WaterQualityReading(Base):
    """Hydrological and urban water quality observation (CPCB, India-WRIS, TSPCB lakes/STPs)."""
    __tablename__ = "water_quality_readings"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city: str = Column(String(128), nullable=False, index=True)
    water_body_name: str = Column(String(128), nullable=False)  # e.g. Hussain Sagar, Durgam Cheruvu, Musi River
    station_code: str = Column(String(64), nullable=True)
    body_type: str = Column(String(64), nullable=False, default="lake")  # lake | river | stp_outflow | groundwater
    latitude: float = Column(Float, nullable=True)
    longitude: float = Column(Float, nullable=True)
    ph: float | None = Column(Float, nullable=True)
    dissolved_oxygen_mgl: float | None = Column(Float, nullable=True)  # Standard: > 4.0 mg/L
    bod_mgl: float | None = Column(Float, nullable=True)  # Biological Oxygen Demand: Standard < 3.0 mg/L
    cod_mgl: float | None = Column(Float, nullable=True)
    total_coliform_mpn: float | None = Column(Float, nullable=True)
    water_quality_index: float | None = Column(Float, nullable=True)  # 0 - 100 WQI
    cpcb_class: str | None = Column(String(8), nullable=True)  # A, B, C, D, E
    source: str = Column(String(128), nullable=False, default="CPCB / TSPCB Water Monitoring Grid")
    recorded_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class UrbanHeatNoiseReading(Base):
    """Micro-climate heat island index and acoustic decibel logs (IMD / CPCB Noise Grid)."""
    __tablename__ = "urban_heat_noise_readings"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city: str = Column(String(128), nullable=False, index=True)
    location_name: str = Column(String(128), nullable=False)
    land_use_type: str = Column(String(64), nullable=False, default="commercial")  # industrial | commercial | residential | silence_zone
    latitude: float = Column(Float, nullable=False)
    longitude: float = Column(Float, nullable=False)
    surface_temperature_c: float | None = Column(Float, nullable=True)
    air_temperature_c: float | None = Column(Float, nullable=True)
    heat_index_c: float | None = Column(Float, nullable=True)
    urban_heat_island_delta: float | None = Column(Float, nullable=True)  # Elevation over rural baseline
    day_noise_db: float | None = Column(Float, nullable=True)  # Standard: Residential 55dB, Commercial 65dB
    night_noise_db: float | None = Column(Float, nullable=True)
    noise_limit_exceeded: bool = Column(Boolean, default=False)
    source: str = Column(String(128), nullable=False, default="CPCB Continuous Noise & IMD Grid")
    recorded_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)


# ---------------------------------------------------------------------------
# Interventions & Impact Actions
# ---------------------------------------------------------------------------

class InterventionPlan(Base):
    """Institutional / Municipal / Community Intervention Program."""
    __tablename__ = "intervention_plans"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: uuid.UUID | None = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    title: str = Column(String(256), nullable=False)
    domain: str = Column(String(64), nullable=False, default="air")  # air | water | transport | heat | solid_waste
    city: str = Column(String(128), nullable=False, index=True)
    target_zone: str = Column(String(128), nullable=False)
    target_metric: str = Column(String(64), nullable=False)  # e.g., PM2.5, BOD, NO2, Land Surface Temp
    baseline_value: float = Column(Float, nullable=False)
    projected_reduction_pct: float = Column(Float, nullable=False)
    capex_inr_lakhs: float = Column(Float, default=0.0)
    opex_inr_lakhs: float = Column(Float, default=0.0)
    evidence_base: str = Column(Text, nullable=True)
    status: str = Column(String(32), default="planned")  # planned | executing | completed | audited
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="interventions")


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
    """User or facility-logged environmental impact action."""
    __tablename__ = "impact_logs"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type: str = Column(String(64), nullable=False)
    category: str = Column(String(64), nullable=False, default="transport")
    description: str = Column(Text, nullable=True)
    co2_saved_kg: float = Column(Float, default=0.0)
    pm25_avoided_ug: float = Column(Float, default=0.0)
    logged_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="impact_logs")


class AlertPreference(Base):
    """User alert preferences for AQI and environmental thresholds."""
    __tablename__ = "alert_preferences"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    aqi_threshold: int = Column(Integer, default=150)
    water_alert_enabled: bool = Column(Boolean, default=True)
    heat_wave_alert_enabled: bool = Column(Boolean, default=True)
    email_alerts: bool = Column(Boolean, default=True)
    push_alerts: bool = Column(Boolean, default=False)
    quiet_hours: dict | None = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", back_populates="alert_preference")


# ---------------------------------------------------------------------------
# Conversations & Audit Trails
# ---------------------------------------------------------------------------

class Conversation(Base):
    """A chat conversation between a user/analyst and SmogGuard / UrbanGuard AI."""
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
    """FastAPI dependency yielding an async database session."""
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
    """Create all tables defined on Base (idempotent startup routine)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
