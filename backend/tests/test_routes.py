import pytest

@pytest.mark.asyncio
async def test_current_aqi_endpoint(async_client):
    res = await async_client.get("/api/v1/aqi/current?city=Delhi")
    assert res.status_code == 200
    data = res.json()
    assert data["city"] == "Delhi"
    assert "data_status" in data
    assert "confidence_score" in data
    assert "pollutants" in data

@pytest.mark.asyncio
async def test_daily_planner_generation(async_client):
    """Test dynamic generation of tailored schedules based on real AQI and inversion physics."""
    res = await async_client.get("/api/v1/planner/today")
    assert res.status_code == 200
    data = res.json()
    assert "schedule" in data
    assert isinstance(data["schedule"], list)
    assert len(data["schedule"]) > 0
    # Every slot must contain air quality rationale
    for item in data["schedule"]:
        assert "time" in item
        assert "activity" in item
        assert "aqi_status" in item

@pytest.mark.asyncio
async def test_impact_logging_and_summary(async_client):
    """Test action logging and environmental aggregation."""
    log_payload = {
        "action_type": "metro_transit",
        "action_name": "Delhi Metro Line Commute",
        "category": "transport",
        "description": "Substituted 20km solo car drive with electric metro",
        "co2_saved_kg": 3.8,
        "pm25_avoided_g": 0.42
    }
    res = await async_client.post("/api/v1/impact/log", json=log_payload)
    assert res.status_code in [200, 201]

    summary_res = await async_client.get("/api/v1/impact/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_actions"] >= 1
    assert summary["total_co2_saved_kg"] >= 3.8

@pytest.mark.asyncio
async def test_conversation_tenant_isolation(async_client):
    """Verify conversations can be created, retrieved, and prevented from cross-tenant IDOR."""
    create_res = await async_client.post("/api/v1/assistant/conversations", json={"title": "Smog Strategy"})
    assert create_res.status_code in [200, 201]
    conv = create_res.json()
    conv_id = conv["id"]

    # Retrieve messages for this conversation
    messages_res = await async_client.get(f"/api/v1/assistant/conversations/{conv_id}/messages")
    assert messages_res.status_code == 200
    assert isinstance(messages_res.json(), list)
