"""
SmogGuard AI — Algorithmic Recommendation & Impact Engine
Provides non-LLM, high-throughput calculations for health risk scores,
rule-based interventions, and quantitative carbon / particulate reduction factors.
"""

from __future__ import annotations

from typing import Any


class RecommendationEngine:
    """Calculates risk assessments and empirical emission reduction metrics."""

    @staticmethod
    def get_health_risk_assessment(
        aqi_data: dict[str, Any], user_profile: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Evaluate health risk by cross-referencing AQI thresholds with
        user vulnerability factors (asthma, COPD, children, elderly).
        """
        aqi = int(aqi_data.get("aqi", 100))
        profile = user_profile or {}
        conditions = profile.get("health_conditions") or {}
        family = profile.get("family_members") or []

        has_vulnerability = any([
            conditions.get("asthma"),
            conditions.get("copd"),
            conditions.get("heart_disease"),
            conditions.get("allergies"),
            any(m.get("is_child") or m.get("is_elderly") for m in family if isinstance(m, dict)),
        ])

        # Base risk calculation
        if aqi <= 50:
            level = "Low"
            score = 15
            desc = "Air quality is satisfactory and poses minimal health risk."
        elif aqi <= 100:
            level = "Moderate"
            score = 35
            desc = "Air quality is acceptable. Very sensitive individuals may experience slight irritation."
        elif aqi <= 150:
            level = "Elevated" if not has_vulnerability else "High"
            score = 55 if not has_vulnerability else 70
            desc = "Members of sensitive groups may experience health effects. General public less likely affected."
        elif aqi <= 200:
            level = "High"
            score = 80
            desc = "Everyone may begin to experience health effects. Sensitive groups experience more serious effects."
        elif aqi <= 300:
            level = "Very High"
            score = 92
            desc = "Health alert: The risk of health effects is increased for everyone in the urban radius."
        else:
            level = "Severe Emergency"
            score = 99
            desc = "Health warning of emergency conditions. The entire population is likely to be severely affected."

        recs = RecommendationEngine._build_health_recommendations(aqi, has_vulnerability)
        warnings = []
        if has_vulnerability:
            warnings.append("Family members flagged with high susceptibility (respiratory/cardiac or young/elderly).")
            if aqi > 120:
                warnings.append(
                    "Mandatory preventative use of HEPA air filtration and N95 masks when stepping outdoors."
                )

        return {
            "risk_level": level,
            "risk_score": score,
            "description": desc,
            "recommendations": recs,
            "vulnerable_groups_warning": warnings,
        }

    @staticmethod
    def _build_health_recommendations(aqi: int, vulnerable: bool) -> list[str]:
        if aqi <= 50:
            return ["Enjoy outdoor ventilation and activities.", "Good day for aerating indoor living spaces."]
        elif aqi <= 100:
            return [
                "Unusually sensitive individuals should consider limiting prolonged outdoor exertion.",
                "Keep windows closed during early morning peak traffic periods.",
            ]
        elif aqi <= 150:
            return [
                "Sensitive individuals should wear an N95 respirator if outdoors for >30 minutes.",
                "Run home air purifiers on low/medium mode.",
                "Avoid intense outdoor cardio or cycling during morning rush hour.",
            ]
        elif aqi <= 200:
            return [
                "Everyone should limit prolonged heavy outdoor exertion.",
                "Wear certified N95/FFP2 masks outdoors; cloth masks offer negligible protection against PM2.5.",
                "Keep windows tightly sealed; use door-bottom draft stoppers.",
                "Use wet mopping rather than dry sweeping to capture indoor settled aerosols.",
            ]
        else:
            return [
                "Strictly avoid all outdoor exercise and non-essential commutes.",
                "Deploy HEPA purifiers continuously in closed primary rooms.",
                "Create a 'clean air sanctuary room' with sealed gaps and active filtration.",
                "Avoid indoor combustion (candles, incense, unvented gas burners).",
            ]

    @staticmethod
    def get_quick_recommendations(aqi: int) -> list[dict[str, Any]]:
        """Quick actionable recommendations with quantified impact badges."""
        if aqi <= 75:
            return [
                {
                    "title": "Natural Aeration Window",
                    "description": "Cross-ventilate rooms between 12 PM - 3 PM when solar heating breaks inversions.",
                    "impact": "Replenishes indoor O2, drops CO2 < 600 ppm",
                    "category": "indoor",
                },
                {
                    "title": "Active Green Commute",
                    "description": "Safe conditions for walking, e-bikes, and public transport.",
                    "impact": "Saves 2.4 kg CO2 vs car trip",
                    "category": "transport",
                },
            ]
        elif aqi <= 150:
            return [
                {
                    "title": "Shift Workout Indoors",
                    "description": "Substitute outdoor jog with home HIIT or yoga.",
                    "impact": "Avoids inhaling ~180 μg PM2.5",
                    "category": "health",
                },
                {
                    "title": "Smart Micro-Transit",
                    "description": "Opt for electric metro or carpooling over solo driving.",
                    "impact": "Cuts travel emissions by 68%",
                    "category": "transport",
                },
                {
                    "title": "Wet Mop Living Zones",
                    "description": "Microfiber wet wipe flat surfaces to trap settled fine particulates.",
                    "impact": "Cuts indoor particulate resuspension by 25%",
                    "category": "indoor",
                },
            ]
        else:
            return [
                {
                    "title": "Seal & Isolate Sanctuary Room",
                    "description": "Seal bedroom window gaps with weather-strips; run HEPA on High.",
                    "impact": "Maintains indoor PM2.5 < 25 μg/m³ even at AQI 300",
                    "category": "indoor",
                },
                {
                    "title": "Mandatory N95 Respirators",
                    "description": "Ensure tight seal over nose bridge for any essential transit.",
                    "impact": "Filters 95%+ of PM2.5 particulates",
                    "category": "health",
                },
                {
                    "title": "Eliminate Indoor Combustion",
                    "description": "Switch to induction cooktops or ensure range hoods vent outside.",
                    "impact": "Prevents indoor NO2 spikes > 100 ppb",
                    "category": "energy",
                },
                {
                    "title": "Work-From-Home / Off-Peak Shift",
                    "description": "Eliminate peak hour traffic exposure when particulate concentrations spike.",
                    "impact": "Saves ~4.5 kg CO2 and prevents toxic acute exposure",
                    "category": "lifestyle",
                },
            ]

    @staticmethod
    def calculate_impact(action_type: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Calculates empirical CO2 and PM2.5 impact of sustainable actions.
        """
        det = details or {}
        qty = float(det.get("quantity", 1.0))

        factors = {
            "public_transit": {"co2_per_unit": 2.3, "pm25_avoided": 120.0, "unit": "trip"},
            "cycling_walking": {"co2_per_unit": 2.8, "pm25_avoided": 150.0, "unit": "trip"},
            "wfh_telecommute": {"co2_per_unit": 4.5, "pm25_avoided": 220.0, "unit": "day"},
            "hepa_filtration": {"co2_per_unit": -0.2, "pm25_avoided": 350.0, "unit": "day"},
            "wet_mopping": {"co2_per_unit": 0.0, "pm25_avoided": 80.0, "unit": "session"},
            "electric_cooking": {"co2_per_unit": 1.4, "pm25_avoided": 180.0, "unit": "day"},
            "indoor_plants": {"co2_per_unit": 0.1, "pm25_avoided": 25.0, "unit": "plant"},
        }

        cfg = factors.get(action_type, {"co2_per_unit": 1.0, "pm25_avoided": 50.0, "unit": "action"})
        co2_saved = round(cfg["co2_per_unit"] * qty, 2)
        pm25_avoided = round(cfg["pm25_avoided"] * qty, 1)

        return {
            "action_type": action_type,
            "co2_saved_kg": max(0.0, co2_saved),
            "pm25_avoided_ug": max(0.0, pm25_avoided),
            "unit": cfg["unit"],
            "explanation": f"Saved {co2_saved} kg CO2 and reduced personal PM2.5 inhalation by {pm25_avoided} μg.",
        }
