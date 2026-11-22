import pytest
from app.config import get_settings
from app.api.auth import create_access_token

@pytest.mark.asyncio
async def test_health_check(async_client):
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "demo_mode" in data

@pytest.mark.asyncio
async def test_auth_demo_mode_user(async_client):
    """When demo_mode is True, requests without Authorization header resolve
    to the sandboxed demo user rather than crashing or leaking guest tokens."""
    settings = get_settings()
    settings.demo_mode = True
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "demo@smogguard.ai"
    assert user_data["full_name"] == "Demo User"

@pytest.mark.asyncio
async def test_auth_production_mode_rejection(async_client):
    """When demo_mode is False, unauthenticated requests MUST be rejected with 401."""
    settings = get_settings()
    settings.demo_mode = False
    try:
        response = await async_client.get("/api/v1/auth/me")
        assert response.status_code == 401
    finally:
        settings.demo_mode = True

@pytest.mark.asyncio
async def test_user_registration_and_login(async_client):
    """Test standard signup and token authentication flow."""
    settings = get_settings()
    settings.demo_mode = False
    try:
        reg_payload = {
            "email": "test_scientist@smogguard.ai",
            "password": "SecurePassword123!",
            "full_name": "Dr. Air Quality"
        }
        res = await async_client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code in [200, 201]

        # Login
        login_res = await async_client.post(
            "/api/v1/auth/login",
            data={"username": "test_scientist@smogguard.ai", "password": "SecurePassword123!"}
        )
        assert login_res.status_code == 200
        tokens = login_res.json()
        assert "access_token" in tokens

        # Authorized /me
        me_res = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "test_scientist@smogguard.ai"
    finally:
        settings.demo_mode = True
