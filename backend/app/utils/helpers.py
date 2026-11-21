"""
SmogGuard AI — Utility Constants and Helper Functions

Provides AQI category mappings, emission factors, PM2.5 reduction factors,
and formatting utilities used across the application.
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------------
# AQI Categories — EPA standard breakpoints
# Maps (lower_bound, upper_bound) → (name, hex_color, emoji, health_message)
# ---------------------------------------------------------------------------
AQI_CATEGORIES: dict[tuple[int, int], tuple[str, str, str, str]] = {
    (0, 50): (
        "Good",
        "#009966",
        "🟢",
        "Air quality is satisfactory, and air pollution poses little or no risk.",
    ),
    (51, 100): (
        "Moderate",
        "#FFDE33",
        "🟡",
        "Air quality is acceptable. However, there may be a risk for some people, "
        "particularly those who are unusually sensitive to air pollution.",
    ),
    (101, 150): (
        "Unhealthy for Sensitive Groups",
        "#FF9933",
        "🟠",
        "Members of sensitive groups may experience health effects. "
        "The general public is less likely to be affected.",
    ),
    (151, 200): (
        "Unhealthy",
        "#CC0033",
        "🔴",
        "Some members of the general public may experience health effects; "
        "members of sensitive groups may experience more serious health effects.",
    ),
    (201, 300): (
        "Very Unhealthy",
        "#660099",
        "🟣",
        "Health alert: The risk of health effects is increased for everyone.",
    ),
    (301, 500): (
        "Hazardous",
        "#7E0023",
        "🟤",
        "Health warning of emergency conditions: everyone is more likely to be affected.",
    ),
}


# ---------------------------------------------------------------------------
# Emission Factors — kg CO₂ per unit
# ---------------------------------------------------------------------------
EMISSION_FACTORS: dict[str, dict[str, Any]] = {
    "car_petrol": {"co2_per_km": 0.21, "unit": "km", "label": "Petrol car"},
    "car_diesel": {"co2_per_km": 0.17, "unit": "km", "label": "Diesel car"},
    "car_electric": {"co2_per_km": 0.05, "unit": "km", "label": "Electric car"},
    "bus": {"co2_per_km": 0.089, "unit": "km", "label": "Public bus"},
    "metro": {"co2_per_km": 0.041, "unit": "km", "label": "Metro / subway"},
    "cycling": {"co2_per_km": 0.0, "unit": "km", "label": "Bicycle"},
    "walking": {"co2_per_km": 0.0, "unit": "km", "label": "Walking"},
    "motorcycle": {"co2_per_km": 0.103, "unit": "km", "label": "Motorcycle"},
    "auto_rickshaw": {"co2_per_km": 0.08, "unit": "km", "label": "Auto-rickshaw"},
    "gas_cooking": {"co2_per_hour": 1.5, "unit": "hour", "label": "Gas stove cooking"},
    "electric_cooking": {"co2_per_hour": 0.4, "unit": "hour", "label": "Electric/induction cooking"},
    "wood_heating": {"co2_per_hour": 3.5, "unit": "hour", "label": "Wood-burning heater"},
    "electric_heating": {"co2_per_hour": 1.2, "unit": "hour", "label": "Electric heater"},
    "air_purifier": {"co2_per_hour": 0.05, "unit": "hour", "label": "Air purifier"},
    "indoor_plant": {"co2_absorbed_per_day": 0.1, "unit": "day", "label": "Indoor plant (avg)"},
}


# ---------------------------------------------------------------------------
# PM2.5 Reduction Factors — approximate percentage reduction indoors
# ---------------------------------------------------------------------------
PM25_REDUCTION_FACTORS: dict[str, dict[str, Any]] = {
    "hepa_air_purifier": {"reduction_pct": 80, "label": "HEPA air purifier"},
    "basic_air_purifier": {"reduction_pct": 50, "label": "Basic air purifier / box-fan filter"},
    "wet_mopping": {"reduction_pct": 25, "label": "Wet mopping floors"},
    "close_windows": {"reduction_pct": 40, "label": "Keeping windows/doors closed"},
    "door_draft_seal": {"reduction_pct": 15, "label": "Sealing door drafts"},
    "indoor_plants": {"reduction_pct": 10, "label": "Indoor plants (5+ plants)"},
    "cooking_exhaust_fan": {"reduction_pct": 30, "label": "Using kitchen exhaust fan"},
    "vacuum_hepa": {"reduction_pct": 20, "label": "Vacuuming with HEPA filter"},
    "no_incense_candles": {"reduction_pct": 35, "label": "Avoiding incense and candles"},
    "n95_mask_indoors": {"reduction_pct": 95, "label": "N95 mask (personal protection)"},
}


def classify_aqi(aqi: int) -> tuple[str, str, str]:
    """Classify AQI into (name, hex_color, health_message)."""
    name, color, emoji, msg = _get_category_tuple(aqi)
    return name, color, msg


def _get_category_tuple(aqi: int) -> tuple[str, str, str, str]:
    """Return the (name, color, emoji, health_message) tuple for a given AQI value."""
    for (lo, hi), info in AQI_CATEGORIES.items():
        if lo <= aqi <= hi:
            return info
    # Fallback for values above 500
    if aqi > 500:
        return AQI_CATEGORIES[(301, 500)]
    return ("Unknown", "#808080", "⚪", "AQI data unavailable.")


def get_aqi_emoji(aqi: int) -> str:
    """Return the appropriate emoji for a given AQI value.

    Args:
        aqi: The Air Quality Index value (0-500+).

    Returns:
        A colored circle emoji representing the AQI category.
    """
    return _get_category_tuple(aqi)[2]


def format_aqi_report(data: dict) -> str:
    """Format AQI data into a human-readable report string.

    Args:
        data: Dictionary containing AQI readings (aqi, pm25, pm10, etc.).

    Returns:
        A multi-line formatted report string.
    """
    aqi_val = data.get("aqi", 0)
    name, color, emoji, health_msg = _get_category_tuple(aqi_val)

    lines = [
        f"{emoji} Air Quality Report — {data.get('city', 'Unknown City')}",
        f"{'─' * 50}",
        f"AQI: {aqi_val}  ({name})",
        f"Health: {health_msg}",
        "",
        "Pollutant Concentrations:",
    ]

    pollutants = {
        "pm25": ("PM2.5", "µg/m³"),
        "pm10": ("PM10", "µg/m³"),
        "no2": ("NO₂", "µg/m³"),
        "so2": ("SO₂", "µg/m³"),
        "o3": ("O₃", "µg/m³"),
        "co": ("CO", "mg/m³"),
    }
    for key, (label, unit) in pollutants.items():
        val = data.get(key)
        if val is not None:
            lines.append(f"  • {label}: {val} {unit}")

    dominant = data.get("dominant_pollutant")
    if dominant:
        lines.append(f"\nDominant Pollutant: {dominant}")

    source = data.get("source")
    if source:
        lines.append(f"Data Source: {source}")

    recorded = data.get("recorded_at")
    if recorded:
        lines.append(f"Recorded At: {recorded}")

    return "\n".join(lines)


def calculate_co2_savings(from_mode: str, to_mode: str, distance_km: float) -> float:
    """Calculate CO₂ savings when switching transport modes.

    Args:
        from_mode: Original transport mode key (e.g. 'car_petrol').
        to_mode: New transport mode key (e.g. 'cycling').
        distance_km: Distance of the trip in kilometres.

    Returns:
        CO₂ savings in kilograms. Negative means the new mode emits *more*.
    """
    from_factor = EMISSION_FACTORS.get(from_mode, {}).get("co2_per_km", 0.0)
    to_factor = EMISSION_FACTORS.get(to_mode, {}).get("co2_per_km", 0.0)
    return round((from_factor - to_factor) * distance_km, 3)
