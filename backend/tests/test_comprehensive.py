"""
SmogGuard AI (UrbanGuard India) — Comprehensive Boundary, Negative, Adversarial & Security Test Suite
Covers unit boundaries, CPCB environmental engines, OWASP security headers, anti-IDOR,
adversarial inputs, AI intelligence intent synthesis, and latency invariants.
"""

from __future__ import annotations

import os
import sys
import time
import uuid
import pytest
from fastapi.testclient import TestClient

# Configure isolated test environment before importing app
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_comprehensive.db"
os.environ["GEMINI_API_KEY"] = "demo-local-key"
os.environ["DEMO_MODE"] = "true"

from app.main import app  # noqa: E402
import app.api.auth as auth_module  # noqa: E402
from app.utils.helpers import classify_aqi  # noqa: E402
from app.services.weather import WeatherService  # noqa: E402
from app.services.indian_urban_engine import indian_data_engine  # noqa: E402
from app.services.intelligence import SmogGuardIntelligence  # noqa: E402
from app.services.air_quality import AirQualityService  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
    if os.path.exists("test_comprehensive.db"):
        try:
            os.remove("test_comprehensive.db")
        except OSError:
            pass


# ---------------------------------------------------------------------------
# 1. BOUNDARY TESTS: AQI, INVERSION, CPCB WATER & NOISE
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "aqi,expected_category",
    [
        (0, "Good"),
        (50, "Good"),
        (51, "Moderate"),
        (100, "Moderate"),
        (101, "Unhealthy for Sensitive Groups"),
        (150, "Unhealthy for Sensitive Groups"),
        (151, "Unhealthy"),
        (200, "Unhealthy"),
        (201, "Very Unhealthy"),
        (300, "Very Unhealthy"),
        (301, "Hazardous"),
        (500, "Hazardous"),
    ],
)
def test_aqi_classification_boundaries(aqi: int, expected_category: str) -> None:
    category, color, message = classify_aqi(aqi)
    assert category == expected_category
    assert color.startswith("#")
    assert len(message) > 5


def test_temperature_inversion_extremes() -> None:
    ws = WeatherService()
    severe = ws.detect_temperature_inversion({"temperature": 10.0, "humidity": 90, "pressure": 1026, "wind_speed": 2.0})
    assert severe["risk_level"] == "Severe"
    assert severe["inversion_score"] >= 70

    low = ws.detect_temperature_inversion({"temperature": 32.0, "humidity": 35, "pressure": 1004, "wind_speed": 22.0})
    assert low["risk_level"] == "Low"
    assert low["inversion_score"] < 45


def test_cpcb_water_quality_classification_boundaries() -> None:
    clean = indian_data_engine.assess_surface_water_quality(
        {"water_body_name": "Test Reservoir", "dissolved_oxygen_mgl": 7.2, "bod_mgl": 1.4, "ph": 7.4}
    )
    assert clean["cpcb_class"] == "Class A"

    polluted = indian_data_engine.assess_surface_water_quality(
        {"water_body_name": "Industrial Drain", "dissolved_oxygen_mgl": 1.8, "bod_mgl": 18.5, "ph": 8.8}
    )
    assert polluted["cpcb_class"] in {"Class D", "Class E"}
    assert polluted["eutrophication_risk"] == "Critical"


def test_cpcb_noise_and_uhi_thresholds() -> None:
    res = indian_data_engine.evaluate_noise_and_heat(
        {
            "location_name": "Residential Zone",
            "land_use_type": "residential",
            "day_noise_db": 64.0,
            "surface_temperature_c": 44.0,
            "air_temperature_c": 37.0,
        }
    )
    assert res["noise_limit_exceeded"] is True
    assert res["urban_heat_island_delta_c"] == pytest.approx(7.0, abs=0.1)


# ---------------------------------------------------------------------------
# 2. SECURITY, ANTI-IDOR & ADVERSARIAL INPUT TESTS
# ---------------------------------------------------------------------------


def test_owasp_security_headers_present(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin" in (resp.headers.get("Referrer-Policy") or "")
    assert "geolocation=()" in (resp.headers.get("Permissions-Policy") or "")


def test_production_mode_rejects_missing_or_invalid_jwt(client: TestClient) -> None:
    original = auth_module.settings.demo_mode
    try:
        auth_module.settings.demo_mode = False
        r_no_auth = client.get("/api/v1/auth/me")
        assert r_no_auth.status_code == 401

        r_bad_jwt = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert r_bad_jwt.status_code == 401
    finally:
        auth_module.settings.demo_mode = original


def test_idor_cross_user_conversation_blocked(client: TestClient) -> None:
    random_conv_id = str(uuid.uuid4())
    resp = client.get(f"/api/v1/assistant/conversations/{random_conv_id}/messages")
    assert resp.status_code == 404


@pytest.mark.parametrize(
    "adversarial_city",
    [
        "'; DROP TABLE users;--",
        "<script>alert(1)</script>",
        "../../etc/passwd",
        "Delhi" * 5,
    ],
)
def test_adversarial_city_inputs_handled_safely(client: TestClient, adversarial_city: str) -> None:
    resp = client.get("/api/v1/aqi/current", params={"city": adversarial_city})
    assert resp.status_code in {200, 400, 422}
    if resp.status_code == 200:
        data = resp.json()
        assert "aqi" in data


def test_empty_chat_message_rejected(client: TestClient) -> None:
    resp = client.post("/api/v1/assistant/chat", json={"message": ""})
    assert resp.status_code in {400, 422}


# ---------------------------------------------------------------------------
# 3. AI INTELLIGENCE INTENT SYNTHESIS & LATENCY INVARIANTS
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_intelligence_fallback_covers_all_intents() -> None:
    intel = SmogGuardIntelligence("demo-local-key", AirQualityService(), WeatherService())
    assert intel.has_valid_key is False

    for prompt, expected_tool in [
        ("Give me DIY indoor air purifier hacks for bangalore", "get_indoor_air_hacks"),
        ("What morning exercise routine should I follow in Mumbai?", "get_weather_and_inversion_status"),
        ("Calculate metro transit CO2 impact", "calculate_sustainable_impact"),
        ("Asthma risk for child in gurgaon", "assess_health_risk"),
    ]:
        res = await intel.chat(prompt, user_context={"city": "Delhi"})
        assert expected_tool in res["tools_used"]
        assert len(res["response"]) > 80


def test_health_endpoint_latency_under_200ms(client: TestClient) -> None:
    t0 = time.perf_counter()
    resp = client.get("/health")
    elapsed_ms = (time.perf_counter() - t0) * 1000
    assert resp.status_code == 200
    assert elapsed_ms < 200.0


# ---------------------------------------------------------------------------
# 4. SSRF SANITIZATION, DATA PROVENANCE & MUNICIPAL API COVERAGE
# ---------------------------------------------------------------------------


def test_city_sanitization_prevents_ssrf_and_path_traversal() -> None:
    clean, encoded = AirQualityService._sanitize_city("../../admin?token=evil")
    assert ".." not in clean
    assert "?" not in clean
    assert "/" not in clean
    assert "%2F" not in encoded and "?" not in encoded


def test_air_record_validation_flags_physical_violations() -> None:
    scored = indian_data_engine.validate_and_score_air_record(
        {"city": "Hyderabad", "aqi": 180, "pm25": 220.0, "pm10": 110.0}
    )
    assert scored["confidence_score"] < 1.0
    assert any("pm25 > pm10" in f.lower() or "physical" in f.lower() for f in scored["quality_flags"])


def test_cpcb_water_classes_b_and_c() -> None:
    class_b = indian_data_engine.assess_surface_water_quality(
        {"water_body_name": "Bathing Ghat", "dissolved_oxygen_mgl": 5.4, "bod_mgl": 2.6, "ph": 7.2}
    )
    assert class_b["cpcb_class"] == "Class B"

    class_c = indian_data_engine.assess_surface_water_quality(
        {"water_body_name": "Intake", "dissolved_oxygen_mgl": 4.2, "bod_mgl": 2.8, "ph": 6.2}
    )
    assert class_c["cpcb_class"] == "Class C"


def test_full_api_routes_integration(client: TestClient) -> None:
    for path in [
        "/api/v1/aqi/current?city=Hyderabad",
        "/api/v1/aqi/forecast?city=Hyderabad",
        "/api/v1/aqi/history?city=Hyderabad&days=7",
        "/api/v1/dashboard",
        "/api/v1/alerts/check",
        "/api/v1/alerts/preferences",
        "/api/v1/impact/summary",
        "/api/v1/planner/routines",
        "/api/v1/municipal/wards?city=Hyderabad",
        "/api/v1/municipal/hotspots?city=Hyderabad&domain=air",
        "/api/v1/municipal/water?city=Hyderabad",
        "/api/v1/municipal/interventions?city=Hyderabad",
    ]:
        r = client.get(path)
        assert r.status_code == 200, f"{path} failed with {r.status_code}"

    r_put = client.put("/api/v1/auth/profile", json={"city": "Hyderabad", "home_type": "Apartment"})
    assert r_put.status_code == 200

    r_prefs = client.put("/api/v1/alerts/preferences", json={"aqi_threshold": 150, "email_enabled": True})
    assert r_prefs.status_code == 200


@pytest.mark.asyncio
async def test_gemini_rest_uses_header_not_query_param_and_falls_back(monkeypatch) -> None:
    import httpx as _httpx

    intel = SmogGuardIntelligence("test-secret-key", AirQualityService(), WeatherService())
    seen_urls: list[str] = []
    seen_headers: list[dict[str, str]] = []

    class MockResp:
        def __init__(self, status_code: int, payload: dict):
            self.status_code = status_code
            self._payload = payload

        def json(self) -> dict:
            return self._payload

    async def mock_post(self, url, json=None, headers=None):
        seen_urls.append(url)
        seen_headers.append(headers or {})
        if "gemini-3-flash-preview" in url:
            return MockResp(503, {"error": "unavailable"})
        return MockResp(
            200,
            {"candidates": [{"content": {"parts": [{"text": "Grounded Gemini reply"}]}}]},
        )

    monkeypatch.setattr(_httpx.AsyncClient, "post", mock_post)
    text, model = await intel._call_gemini_rest("Hello", "System prompt")
    assert text == "Grounded Gemini reply"
    assert model == "gemini-3.1-flash-lite"
    assert all("?key=" not in u for u in seen_urls)
    assert all(h.get("x-goog-api-key") == "test-secret-key" for h in seen_headers)
