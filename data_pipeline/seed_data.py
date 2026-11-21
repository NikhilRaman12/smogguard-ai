"""
SmogGuard AI — Data Pipeline Seed Script
==========================================
Seeds the PostgreSQL database with initial data for development and demo purposes.

Requirements:
    httpx==0.27.0
    sqlalchemy==2.0.35
    psycopg2-binary==2.9.9
    python-dotenv==1.0.1

Usage:
    cd data_pipeline
    pip install -r requirements.txt
    python seed_data.py

The script expects either:
  - A .env file in the parent directory (../), or
  - DATABASE_URL and WAQI_API_TOKEN environment variables to be set.
"""

import os
import sys
import uuid
import datetime
import json
from pathlib import Path

import httpx
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    MetaData,
    Table,
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    Date,
    DateTime,
    JSON,
    ForeignKey,
    inspect,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from passlib.hash import bcrypt

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Load .env from project root (one level up from data_pipeline/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://smogguard:smogguard@localhost:5432/smogguard",
)
# Seed script uses synchronous psycopg2, so swap the async driver prefix
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")

WAQI_API_TOKEN = os.getenv("WAQI_API_TOKEN", "demo")

# ---------------------------------------------------------------------------
# Schema mirror (must match backend/app/models/database.py)
# ---------------------------------------------------------------------------

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("email", String, unique=True, nullable=False),
    Column("password_hash", String, nullable=False),
    Column("name", String, nullable=False),
    Column("latitude", Float, nullable=True),
    Column("longitude", Float, nullable=True),
    Column("city", String, nullable=True),
    Column("country", String, nullable=True),
    Column("health_conditions", JSON, nullable=True),
    Column("family_members", JSON, nullable=True),
    Column("home_type", String, nullable=True),
    Column("created_at", DateTime, default=datetime.datetime.utcnow),
)

aqi_readings = Table(
    "aqi_readings",
    metadata,
    Column("id", PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("city", String, nullable=False),
    Column("latitude", Float, nullable=True),
    Column("longitude", Float, nullable=True),
    Column("aqi", Integer, nullable=False),
    Column("pm25", Float, nullable=True),
    Column("pm10", Float, nullable=True),
    Column("no2", Float, nullable=True),
    Column("so2", Float, nullable=True),
    Column("o3", Float, nullable=True),
    Column("co", Float, nullable=True),
    Column("dominant_pollutant", String, nullable=True),
    Column("source", String, nullable=True),
    Column("temperature", Float, nullable=True),
    Column("humidity", Float, nullable=True),
    Column("wind_speed", Float, nullable=True),
    Column("recorded_at", DateTime, default=datetime.datetime.utcnow),
)

impact_logs = Table(
    "impact_logs",
    metadata,
    Column("id", PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False),
    Column("action_type", String, nullable=False),
    Column("description", Text, nullable=True),
    Column("co2_saved_kg", Float, nullable=True),
    Column("pm25_avoided_ug", Float, nullable=True),
    Column("logged_at", DateTime, default=datetime.datetime.utcnow),
)

alert_preferences = Table(
    "alert_preferences",
    metadata,
    Column("id", PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", PG_UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False),
    Column("aqi_threshold", Integer, default=150),
    Column("email_alerts", Boolean, default=True),
    Column("push_alerts", Boolean, default=False),
    Column("quiet_hours", JSON, nullable=True),
)

# ---------------------------------------------------------------------------
# WAQI data fetching
# ---------------------------------------------------------------------------

CITIES = [
    "Delhi",
    "Beijing",
    "Lahore",
    "Dhaka",
    "Kolkata",
    "Mumbai",
    "Cairo",
    "Chengdu",
    "Hanoi",
    "Jakarta",
]


def fetch_aqi(city: str, client: httpx.Client) -> dict | None:
    """Fetch current AQI for a city from the WAQI API."""
    url = f"https://api.waqi.info/feed/{city}/?token={WAQI_API_TOKEN}"
    try:
        resp = client.get(url, timeout=15)
        data = resp.json()
        if data.get("status") != "ok":
            print(f"  ⚠  WAQI returned non-ok for {city}: {data.get('data', 'unknown error')}")
            return None

        d = data["data"]
        iaqi = d.get("iaqi", {})

        return {
            "id": uuid.uuid4(),
            "city": d.get("city", {}).get("name", city),
            "latitude": (d.get("city", {}).get("geo") or [None, None])[0],
            "longitude": (d.get("city", {}).get("geo") or [None, None])[1],
            "aqi": int(d.get("aqi", 0)),
            "pm25": iaqi.get("pm25", {}).get("v"),
            "pm10": iaqi.get("pm10", {}).get("v"),
            "no2": iaqi.get("no2", {}).get("v"),
            "so2": iaqi.get("so2", {}).get("v"),
            "o3": iaqi.get("o3", {}).get("v"),
            "co": iaqi.get("co", {}).get("v"),
            "dominant_pollutant": d.get("dominentpol"),
            "source": "waqi",
            "temperature": iaqi.get("t", {}).get("v"),
            "humidity": iaqi.get("h", {}).get("v"),
            "wind_speed": iaqi.get("w", {}).get("v"),
            "recorded_at": datetime.datetime.utcnow(),
        }
    except Exception as exc:
        print(f"  ✗  Failed to fetch AQI for {city}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Sample impact data
# ---------------------------------------------------------------------------

SAMPLE_IMPACTS = [
    {
        "action_type": "transport",
        "description": "Used public metro instead of driving to work",
        "co2_saved_kg": 4.2,
        "pm25_avoided_ug": 12.5,
    },
    {
        "action_type": "energy",
        "description": "Switched to LED bulbs in living room",
        "co2_saved_kg": 0.8,
        "pm25_avoided_ug": 2.1,
    },
    {
        "action_type": "transport",
        "description": "Carpooled with neighbor for school drop-off",
        "co2_saved_kg": 2.1,
        "pm25_avoided_ug": 6.3,
    },
    {
        "action_type": "indoor",
        "description": "Sealed windows and ran DIY air purifier",
        "co2_saved_kg": 0.0,
        "pm25_avoided_ug": 45.0,
    },
    {
        "action_type": "cooking",
        "description": "Used induction stove instead of gas burner",
        "co2_saved_kg": 1.5,
        "pm25_avoided_ug": 8.7,
    },
    {
        "action_type": "transport",
        "description": "Walked to grocery store (1.2 km round trip)",
        "co2_saved_kg": 0.9,
        "pm25_avoided_ug": 3.0,
    },
    {
        "action_type": "energy",
        "description": "Air-dried laundry instead of using dryer",
        "co2_saved_kg": 2.5,
        "pm25_avoided_ug": 0.5,
    },
]


# ---------------------------------------------------------------------------
# Main seed routine
# ---------------------------------------------------------------------------


def seed():
    print("=" * 60)
    print("  SmogGuard AI — Database Seed Script")
    print("=" * 60)
    print(f"  Database : {SYNC_DATABASE_URL.split('@')[-1]}")
    print(f"  WAQI token: {'demo' if WAQI_API_TOKEN == 'demo' else '****'}")
    print()

    engine = create_engine(SYNC_DATABASE_URL, echo=False)

    # Ensure tables exist (create if not present — matches backend models)
    metadata.create_all(engine, checkfirst=True)

    with engine.begin() as conn:
        # ── 1. Demo user ──────────────────────────────────────────────
        print("[1/4] Creating demo user …")
        demo_user_id = uuid.uuid4()
        hashed_pw = bcrypt.using(rounds=12).hash("demo123")

        # Upsert-like: delete existing demo user to avoid unique-constraint errors
        conn.execute(users.delete().where(users.c.email == "demo@smogguard.ai"))
        conn.execute(
            users.insert().values(
                id=demo_user_id,
                email="demo@smogguard.ai",
                password_hash=hashed_pw,
                name="Demo User",
                latitude=28.6139,
                longitude=77.2090,
                city="Delhi",
                country="India",
                health_conditions=json.dumps(["asthma"]),
                family_members=json.dumps(
                    [
                        {"name": "Child", "age": 8, "conditions": []},
                        {"name": "Grandparent", "age": 72, "conditions": ["COPD"]},
                    ]
                ),
                home_type="apartment",
                created_at=datetime.datetime.utcnow(),
            )
        )
        print(f"  ✓  demo@smogguard.ai / demo123  (id={demo_user_id})")

        # ── 2. AQI readings ──────────────────────────────────────────
        print(f"\n[2/4] Fetching live AQI for {len(CITIES)} cities …")
        readings = []
        with httpx.Client() as http:
            for city in CITIES:
                print(f"  → {city} …", end=" ")
                row = fetch_aqi(city, http)
                if row:
                    readings.append(row)
                    print(f"AQI {row['aqi']}")
                else:
                    print("skipped")

        if readings:
            conn.execute(aqi_readings.insert(), readings)
            print(f"  ✓  Inserted {len(readings)} AQI readings")
        else:
            print("  ⚠  No AQI readings fetched (API may be rate-limited)")

        # ── 3. Impact logs ────────────────────────────────────────────
        print("\n[3/4] Creating sample impact logs …")
        now = datetime.datetime.utcnow()
        impact_rows = []
        for i, imp in enumerate(SAMPLE_IMPACTS):
            impact_rows.append(
                {
                    "id": uuid.uuid4(),
                    "user_id": demo_user_id,
                    "action_type": imp["action_type"],
                    "description": imp["description"],
                    "co2_saved_kg": imp["co2_saved_kg"],
                    "pm25_avoided_ug": imp["pm25_avoided_ug"],
                    "logged_at": now - datetime.timedelta(days=len(SAMPLE_IMPACTS) - i),
                }
            )
        conn.execute(impact_logs.insert(), impact_rows)
        print(f"  ✓  Inserted {len(impact_rows)} impact log entries")

        # ── 4. Alert preferences ─────────────────────────────────────
        print("\n[4/4] Setting up alert preferences …")
        conn.execute(
            alert_preferences.delete().where(
                alert_preferences.c.user_id == demo_user_id
            )
        )
        conn.execute(
            alert_preferences.insert().values(
                id=uuid.uuid4(),
                user_id=demo_user_id,
                aqi_threshold=150,
                email_alerts=True,
                push_alerts=False,
                quiet_hours=json.dumps({"start": "22:00", "end": "07:00"}),
            )
        )
        print("  ✓  Alert preferences configured (threshold=150)")

    print()
    print("=" * 60)
    print("  ✅  Seed complete!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        seed()
    except Exception as exc:
        print(f"\n  ✗  Seed failed: {exc}", file=sys.stderr)
        sys.exit(1)
