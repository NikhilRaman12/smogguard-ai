"""
SmogGuard AI — Application Configuration

Loads all configuration from environment variables using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    database_url: str = Field(
        default="postgresql+asyncpg://smogguard:smogguard@db:5432/smogguard",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(
        default="redis://redis:6379/0",
        alias="REDIS_URL",
    )
    gemini_api_key: str = Field(
        default="",
        alias="GEMINI_API_KEY",
    )
    waqi_api_token: str = Field(
        default="demo",
        alias="WAQI_API_TOKEN",
    )
    openweathermap_api_key: str = Field(
        default="",
        alias="OPENWEATHERMAP_API_KEY",
    )
    openaq_api_key: str = Field(
        default="",
        alias="OPENAQ_API_KEY",
    )
    jwt_secret_key: str = Field(
        default="smogguard-fallback-secret-key-change-in-production-a7f3b9c2d1e4",
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
    )
    jwt_expire_minutes: int = Field(
        default=1440,
        alias="JWT_EXPIRE_MINUTES",
    )
    app_name: str = Field(
        default="SmogGuard AI",
        alias="APP_NAME",
    )

    @property
    def DATABASE_URL(self) -> str:
        return self.database_url

    @property
    def GEMINI_API_KEY(self) -> str:
        return self.gemini_api_key

    @property
    def WAQI_API_TOKEN(self) -> str:
        return self.waqi_api_token


def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
