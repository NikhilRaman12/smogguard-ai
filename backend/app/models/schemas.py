"""
SmogGuard AI — Pydantic v2 Request / Response Schemas

Every API endpoint serialises through these models for validation,
documentation, and type safety.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


# =====================================================================
# Auth / User schemas
# =====================================================================


class UserCreate(BaseModel):
    """Payload for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=128)
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    country: str | None = None
    health_conditions: dict[str, Any] | None = None
    family_members: list[dict[str, Any]] | None = None
    home_type: str | None = None


class UserLogin(BaseModel):
    """Payload for user login."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public user profile returned by the API."""

    id: Any
    email: str
    name: str
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    country: str | None = None
    health_conditions: dict[str, Any] | None = None
    family_members: list[dict[str, Any]] | None = None
    home_type: str | None = None
    created_at: datetime | None = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {uuid.UUID: str},
    }


class UserProfileUpdate(BaseModel):
    """Optional-field payload for updating a user profile."""

    name: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    country: str | None = None
    health_conditions: dict[str, Any] | None = None
    family_members: list[dict[str, Any]] | None = None
    home_type: str | None = None


class TokenResponse(BaseModel):
    """JWT token returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"


# =====================================================================
# AQI schemas
# =====================================================================


class AQICurrentResponse(BaseModel):
    """Real-time air quality reading."""

    aqi: int
    pm25: float | None = None
    pm10: float | None = None
    no2: float | None = None
    so2: float | None = None
    o3: float | None = None
    co: float | None = None
    dominant_pollutant: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    health_category: str | None = None
    color_code: str | None = None
    health_message: str | None = None
    recorded_at: datetime | None = None
    source: str | None = None


class AQIForecastDay(BaseModel):
    """Single day of a pollutant forecast."""

    date: str
    avg: float
    min: float
    max: float


class AQIForecastResponse(BaseModel):
    """Multi-day AQI forecast grouped by pollutant."""

    city: str
    forecasts: dict[str, list[AQIForecastDay]]


# =====================================================================
# Chat / Assistant schemas
# =====================================================================


class ChatRequest(BaseModel):
    """Incoming chat message from the user."""

    message: str = Field(..., min_length=1, max_length=4096)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    """AI assistant response."""

    response: str
    conversation_id: str
    tools_used: list[str] = Field(default_factory=list)
    data_sources: list[str] = Field(default_factory=list)


class ConversationListItem(BaseModel):
    """Summary of a conversation for listing endpoints."""

    id: str
    title: str | None = None
    created_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    """Single chat message."""

    id: str
    role: str
    content: str | None = None
    tool_calls: dict[str, Any] | list | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# =====================================================================
# Planner / Daily Routine schemas
# =====================================================================


class DailyRoutineRequest(BaseModel):
    """Request to generate a daily routine."""

    target_date: date | None = None
    preferences: dict[str, Any] | None = None


class DailyRoutineResponse(BaseModel):
    """Generated daily routine."""

    id: str
    plan_date: date
    routine_data: dict[str, Any]
    estimated_emission_reduction_pct: int | None = None
    aqi_at_generation: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# =====================================================================
# Impact tracking schemas
# =====================================================================


class ImpactLogCreate(BaseModel):
    """Payload to log an environmental impact action."""

    action_type: str = Field(..., min_length=1, max_length=64)
    description: str | None = None
    co2_saved_kg: float = 0.0
    pm25_avoided_ug: float = 0.0


class ImpactSummaryResponse(BaseModel):
    """Aggregated impact summary for a user."""

    total_co2_saved_kg: float = 0.0
    total_pm25_avoided_ug: float = 0.0
    actions_count: int = 0
    streak_days: int = 0
    top_actions: list[dict[str, Any]] = Field(default_factory=list)


# =====================================================================
# Alert schemas
# =====================================================================


class AlertPreferenceUpdate(BaseModel):
    """Payload to update alert preferences."""

    aqi_threshold: int | None = None
    email_alerts: bool | None = None
    push_alerts: bool | None = None
    quiet_hours: dict[str, Any] | None = None


class AlertCheckResponse(BaseModel):
    """Result of an alert check against user threshold."""

    alert_active: bool
    current_aqi: int
    threshold: int
    message: str
    recommendations: list[str] = Field(default_factory=list)


# =====================================================================
# Health risk schemas
# =====================================================================


class HealthRiskResponse(BaseModel):
    """Health risk assessment based on AQI and user profile."""

    risk_level: str
    risk_score: int
    description: str
    recommendations: list[str] = Field(default_factory=list)
    vulnerable_groups_warning: list[str] = Field(default_factory=list)


# =====================================================================
# Dashboard schemas
# =====================================================================


class DashboardResponse(BaseModel):
    """Combined dashboard data for fast front-end loading."""

    aqi: AQICurrentResponse
    weather: dict[str, Any] = Field(default_factory=dict)
    health_risk: HealthRiskResponse
    quick_recommendations: list[dict[str, Any]] = Field(default_factory=list)
    recent_impact: dict[str, Any] = Field(default_factory=dict)
