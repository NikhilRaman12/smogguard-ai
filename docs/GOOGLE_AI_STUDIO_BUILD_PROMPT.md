# Google AI Studio Build Prompt — SmogGuard Enterprise Intelligence (Phase 0 + Phase 1)

You are working on the EXISTING SmogGuard AI project, not a blank app. Preserve its React/Vite frontend, FastAPI/Python backend, PostgreSQL models, LangChain/Gemini integration and current pages. The project repository is https://github.com/NikhilRaman12/smogguard-ai. The user wants this evolved into an enterprise-grade agentic urban air/environmental intelligence platform for families, communities and municipal agencies. It is not a generic chatbot.

## Mission
Implement the next safe, testable increment: TRUST & DATA FOUNDATION followed by typed intelligence contracts. Do not attempt a full rewrite or generate fake live telemetry.

## Existing baseline
FastAPI backend under backend/app, routes in backend/app/api/routes.py, services include air_quality.py, intelligence.py, recommendations.py, weather.py. React UI under frontend/src/pages. Existing dashboard and chat currently fabricate plausible readings on failures. The backend AQI service also falls back to synthetic city values; forecast and weather services produce deterministic estimates. Current LangChain agent is a ReAct executor with six tools; tool functions use asyncio.run and can conflict with an async FastAPI event loop. Existing routines, impact values and inversion assertions include unsupported precision.

## Mandatory principles
1. Never show synthetic data as live. Source failure should return explicit unavailable/degraded state and no invented AQI/pollutant values.
2. Demo fixtures must have a clear DEMO label, fixed scenario timestamp, and isolated demo mode; no silent live-to-demo fallback.
3. Environmental claims need provenance: metric/value/unit, location/station if available, observation and retrieval timestamps, source, status (observed/modelled/estimated/simulated/demo/unavailable), quality/limitations.
4. Do not call surface-weather heuristics a confirmed temperature inversion; report “stagnation/inversion indicators” with limits.
5. Distinguish emissions avoided, ambient concentration change, personal exposure estimates and measured outcomes. Do not claim causal/verified impact without follow-up data.
6. Remove unsubstantiated numeric claims from recommendations; show assumptions and references or qualify them.
7. Keep Gemini API credentials server-side in environment/secret store. Never commit key or send it to browser.
8. No hidden chain-of-thought. Display workflow trace, tools, evidence, decisions and concise rationale only.
9. Do not automatically contact agencies, send notices, trigger actions or modify external systems; require human approval.
10. Retain existing functionality, auth and data models where possible; make additive, documented changes.

## Phase 0 tasks
- Audit every frontend fallback and backend fallback in AQI, forecast, weather, intelligence, dashboard, assistant, planner, impact and alerts.
- Replace fallbacks on live paths with typed unavailable/degraded responses.
- Add clear data-status UI for source unavailable, stale, estimated and demo. Do not display empty/missing values as zero.
- If preserving demo experience, create explicit demo mode with fixture data and a visible persistent DEMO banner, separate API route/configuration and no blending with live data.
- Fix city/location defaults: don't assume Delhi; use user location/profile or ask for target area. Handle unknown city explicitly.
- Add tests that assert no fallback values are presented as observed data.

## Phase 1 contract design
Create typed Pydantic domain schemas (prefer a new intelligence/domain package) for:
- DataProvenance / Observation / DataQuality
- EvidenceReference
- SourceHypothesis (candidate, evidence for/against, confidence rationale, unresolved gaps; not a definitive attribution)
- EnvironmentalRun (run id, objective, location, time range, status, trace)
- Intervention (action, owner, cost/feasibility, expected mechanism, KPI, evidence, assumptions)
- ScenarioResult (baseline, scenario, metrics, ranges, model/factor references, limitations)
- ImpactVerification (verified/inconclusive/not-verified; baseline/post, confounders, evidence)
- AgentTraceEvent (agent/node, tool, event status, timestamps, duration, concise input/output summaries, references, error; never chain-of-thought)

Keep the contracts normalized, validated, versionable and documented. Ensure units and time zone handling are explicit.

## Architecture target (plan, don't overbuild in this increment)
FastAPI thin routes → typed domain/use cases → normalized data adapters → deterministic analytics → LangGraph orchestration → evidence-grounded structured recommendations → PostgreSQL persistence → UI. Gemini is used for planning/synthesis, not inventing calculations. Use LangGraph for conditional workflow/state, tool execution, bounded retries, checkpointing and human approval gates. Specialist agents: Atmosphere/Data, Hotspot, Source Investigation, Exposure Protection, Intervention Strategist, Scenario/Impact, Verification, Civic Action. They are not separate LLM calls for every task; route based on need and use deterministic components wherever possible.

## Quality
- Run backend tests/ruff or available lint; run frontend npm build.
- If tests can't be run in this environment, explicitly list unverified checks and provide exact commands.
- Add concise docs explaining provenance contract and data-status behavior.
- Make small commits, preserve current API where possible.
- Before finishing, provide a summary of changed files, test results, limitations and next phase.

## Work in this repository
Start by inspecting actual files and current tree. Implement Phase 0 in the smallest coherent set of changes, add regression tests, and verify. Don't invent repository paths. Avoid sweeping UI redesign in this first increment.