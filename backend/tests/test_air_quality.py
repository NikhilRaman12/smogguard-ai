import pytest
from app.services.air_quality import AirQualityService

@pytest.fixture
def aq_service():
    return AirQualityService()

@pytest.mark.asyncio
async def test_air_quality_provenance_schema(aq_service):
    """Verify that AQI responses include strict provenance fields:
    data_status, confidence_score, and limitations."""
    data = await aq_service.get_realtime_aqi("Delhi")
    assert "data_status" in data
    assert data["data_status"] in ["live", "cached", "estimated", "simulated", "unavailable"]
    assert "confidence_score" in data
    assert 0.0 <= data["confidence_score"] <= 1.0
    assert "limitations" in data
    assert isinstance(data["limitations"], list)
    assert len(data["limitations"]) > 0

@pytest.mark.asyncio
async def test_air_quality_simulated_fallback(aq_service):
    """Verify fallback behavior marks status as simulated with explicit disclaimer."""
    fallback = aq_service._generate_fallback_aqi("Atlantis")
    assert fallback["data_status"] == "simulated"
    assert fallback["confidence_score"] == 0.75
    assert any("Simulated fallback" in lim for lim in fallback["limitations"])
    assert fallback["city"] == "Atlantis"
    assert "pm25" in fallback["pollutants"]

@pytest.mark.asyncio
async def test_forecast_and_inversion(aq_service):
    """Verify forecast generation and payload properties."""
    forecast = await aq_service.get_aqi_forecast("Delhi", days=3)
    assert len(forecast) == 3
    assert all("predicted_aqi" in f for f in forecast)
    assert all("inversion_risk" in f for f in forecast)
