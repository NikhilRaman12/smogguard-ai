"""
SmogGuard AI (UrbanGuard India) — Unbeatable Playwright Real-Browser E2E Suite
Exercises every frontend route, live Gemini AI Assistant interaction, municipal
command tabs, planner, impact ledger, mobile responsiveness, accessibility, and
zero-error console/network invariants against http://127.0.0.1:3000.
"""

from __future__ import annotations

import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:3000"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

passed = 0
failed = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        passed += 1
        print(f" {GREEN}✓{RESET} {name}")
    else:
        failed += 1
        print(f" {RED}✗{RESET} {name} — {detail}")


def launch_browser(p):
    """Launch headless Chromium, falling back to Edge or Chrome on Windows."""
    for kwargs in (
        {"headless": True},
        {"channel": "msedge", "headless": True},
        {"channel": "chrome", "headless": True},
    ):
        try:
            return p.chromium.launch(**kwargs)
        except Exception:
            continue
    raise RuntimeError("No Chromium/Edge/Chrome browser available for Playwright.")


def run_suite() -> int:
    print("\n" + "=" * 68)
    print("   SMOGGUARD AI: PLAYWRIGHT REAL-BROWSER E2E CERTIFICATION SUITE")
    print("=" * 68)

    with sync_playwright() as p:
        browser = launch_browser(p)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors: list[str] = []
        page_errors: list[str] = []
        server_errors: list[str] = []

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on(
            "response",
            lambda res: server_errors.append(f"{res.status} {res.url}") if res.status >= 500 else None,
        )

        # ------------------------------------------------------------------
        # 1. DASHBOARD & MUNICIPAL INTELLIGENCE HUB
        # ------------------------------------------------------------------
        print(f"\n{YELLOW}[1. DASHBOARD, TELEMETRY & MUNICIPAL COMMAND HUB]{RESET}")
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(1200)

        body_text = page.inner_text("body")
        check("Dashboard renders non-empty UI", len(body_text.strip()) > 200)
        check("Dashboard displays SmogGuard / UrbanGuard branding", "SmogGuard" in body_text or "UrbanGuard" in body_text)
        check("Atmospheric Particle Canvas mounted", page.locator("canvas").count() >= 1)
        check("AQI telemetry rendered on Dashboard", "AQI" in body_text and ("PM2.5" in body_text or "µg/m³" in body_text))

        # Test Municipal Intelligence Hub tabs if present
        for tab_label in ["Ward", "Hotspot", "Water", "Intervention"]:
            btn = page.locator("button", has_text=tab_label).first
            if btn.count() > 0:
                btn.click()
                page.wait_for_timeout(400)
                check(f"Municipal tab '{tab_label}' interactive & renders cleanly", len(page.inner_text("body")) > 200)

        # ------------------------------------------------------------------
        # 2. LIVE GEMINI AI ASSISTANT (/assistant)
        # ------------------------------------------------------------------
        print(f"\n{YELLOW}[2. LIVE GEMINI AI ASSISTANT WORKFLOW (/assistant)]{RESET}")
        page.goto(f"{BASE_URL}/assistant", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(800)

        asst_text = page.inner_text("body")
        check("AI Assistant route renders without blank screen", "SmogGuard Multi-Tool Assistant" in asst_text)

        chat_input = page.locator("input[type='text']").first
        send_btn = page.locator("button[type='submit']").first
        check("Chat input and Send button visible", chat_input.is_visible() and send_btn.is_visible())

        # Prompt 1: Environmental + City query
        msg_count_before = page.locator(".prose").count()
        chat_input.fill("What is the air quality in Hyderabad and give 2 indoor hacks?")
        send_btn.click()

        # Wait up to 25s for new assistant markdown bubble
        deadline = time.time() + 25
        while time.time() < deadline:
            if page.locator(".prose").count() > msg_count_before:
                break
            page.wait_for_timeout(400)

        msg_count_after = page.locator(".prose").count()
        latest_reply = page.locator(".prose").last.inner_text() if msg_count_after > 0 else ""
        check(
            "AI Assistant returns live Hyderabad environmental response in UI",
            msg_count_after > msg_count_before and ("Hyderabad" in latest_reply or "AQI" in latest_reply),
            f"count={msg_count_after}",
        )

        # Prompt 2: General knowledge query ("answer anything user ask")
        msg_count_before2 = page.locator(".prose").count()
        chat_input.fill("What is the capital of Japan? Reply concisely.")
        send_btn.click()

        deadline = time.time() + 25
        while time.time() < deadline:
            if page.locator(".prose").count() > msg_count_before2:
                break
            page.wait_for_timeout(400)

        msg_count_after2 = page.locator(".prose").count()
        latest_reply2 = page.locator(".prose").last.inner_text() if msg_count_after2 > 0 else ""
        check(
            "AI Assistant answers general non-AQI questions (Tokyo)",
            msg_count_after2 > msg_count_before2 and "Tokyo" in latest_reply2,
            f"reply={latest_reply2[:80]}",
        )

        # New Session reset button
        new_session_btn = page.locator("button[title='Start new conversation']").first
        if new_session_btn.count() > 0:
            new_session_btn.click()
            page.wait_for_timeout(400)
            check("New Session button resets conversation feed", "New session started" in page.inner_text("body"))

        # ------------------------------------------------------------------
        # 3. DAILY PLANNER, IMPACT TRACKER, ALERTS & PROFILE ROUTES
        # ------------------------------------------------------------------
        print(f"\n{YELLOW}[3. PLANNER, IMPACT LEDGER, ALERTS & PROFILE ROUTES]{RESET}")
        for route, marker in [
            ("/planner", "Routine"),
            ("/impact", "Impact"),
            ("/alerts", "Alert"),
            ("/profile", "Profile"),
        ]:
            page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=20000)
            page.wait_for_timeout(600)
            txt = page.inner_text("body")
            check(f"Route {route} renders cleanly", len(txt.strip()) > 100 and marker.lower() in txt.lower())

        # ------------------------------------------------------------------
        # 4. ACCESSIBILITY & MOBILE RESPONSIVE AUDIT
        # ------------------------------------------------------------------
        print(f"\n{YELLOW}[4. ACCESSIBILITY & MOBILE VIEWPORT AUDIT (375x812)]{RESET}")
        html_lang = page.locator("html").get_attribute("lang")
        title_text = page.title()
        viewport_meta = page.locator("meta[name='viewport']").get_attribute("content") or ""
        check("Document has <html lang='en'>", html_lang == "en")
        check("Document has descriptive <title>", "SmogGuard" in title_text)
        check("Viewport meta tag configured", "width=device-width" in viewport_meta)

        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(f"{BASE_URL}/assistant", wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(600)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
        check("Mobile viewport (375px) has zero horizontal overflow", not overflow)

        # ------------------------------------------------------------------
        # 5. RUNTIME ERROR & NETWORK INTEGRITY INVARIANTS
        # ------------------------------------------------------------------
        print(f"\n{YELLOW}[5. ZERO-ERROR CONSOLE & NETWORK INVARIANTS]{RESET}")
        check("Zero uncaught JavaScript page errors", len(page_errors) == 0, "; ".join(page_errors))
        check("Zero browser console errors", len(console_errors) == 0, "; ".join(console_errors))
        check("Zero HTTP 5xx server responses", len(server_errors) == 0, "; ".join(server_errors))

        browser.close()

    print("\n" + "=" * 68)
    print(f"   PLAYWRIGHT E2E RESULT: {GREEN}{passed} PASSED{RESET} | {RED if failed else GREEN}{failed} FAILED{RESET}")
    print("=" * 68 + "\n")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_suite())
