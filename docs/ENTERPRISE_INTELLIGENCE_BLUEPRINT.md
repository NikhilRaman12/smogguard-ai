# SmogGuard AI — Enterprise Environmental Intelligence Blueprint

## Product definition
SmogGuard is an evidence-first urban environmental intelligence and intervention platform. It serves residents, community organizations, and municipal decision-makers. It is not a general-purpose chatbot.

Core loop: OBSERVE → DETECT → INVESTIGATE → ASSESS → SIMULATE → RECOMMEND → APPROVE → MEASURE → VERIFY.

## Existing baseline (retain and evolve)
- React/Vite/Tailwind frontend with dashboard, assistant, planner, impact, alerts and profile.
- FastAPI backend, async SQLAlchemy/PostgreSQL, Redis in Docker.
- WAQI air-quality integration, optional OpenWeatherMap, LangChain tools, Gemini.
- Existing profile, conversation, AQI reading, routine, impact and alert models.

Do not rewrite the app wholesale. Preserve working features and API compatibility unless a migration is deliberately documented.

## Non-negotiable trust contract
Every environmental datum and every impact claim must carry provenance:
- `value`, `unit`, `metric`, `location`, `observed_at`, `retrieved_at`
- `source_name`, `source_url` when available, `station_id` when available
- `status`: observed | modeled | estimated | simulated | demo | unavailable
- `quality`: confidence/quality explanation and known limitations

Never replace failed live data with a plausible fake while labelling it live. Demo data must be visibly DEMO and isolated from production/live paths. Missing data remains missing. The UI must display source, timestamp, status and stale-data warning.

Keep the following distinctions explicit:
1. Measured: sensor/API observations.
2. Inferred: candidate explanations based on evidence, not proven source attribution.
3. Simulated: scenario output under stated assumptions.
4. Estimated: modelled benefit with assumptions and uncertainty.
5. Verified: outcome confirmed against predefined evidence and measurement criteria.

No correlation-based source claims. Do not claim an intervention caused a citywide pollutant change without an evaluation design and confounder checks.

## Target architecture
### Backend
- FastAPI routes remain thin: validation, auth, invoking use cases, response serialization.
- Domain models / Pydantic contracts define environmental observations, evidence, hypotheses, interventions, scenario results, action plans, verification outcomes.
- Data adapters: WAQI/OpenAQ/CPCB-compatible adapters, weather provider, geocoding/location, optional traffic/construction/waste/land-use datasets. Each adapter returns normalized records with provenance, freshness and error status.
- Deterministic analytics: pollutant AQI normalization where standards are declared; data-quality checks; temporal/spatial hotspot scoring; meteorological stagnation indicators; exposure scenario calculations; intervention ranking. Explain assumptions; keep model code separate from LLM.
- LangGraph orchestration: typed shared state, nodes, conditional edges, bounded retries, timeouts, checkpoints, trace events and human approval before any external civic action.
- Gemini via Google AI Studio API key, injected through server environment. No API key in frontend, source files, commits, logs or prompts.
- PostgreSQL persistence for investigation runs, evidence, hypotheses, intervention plans, scenario runs, approval decisions and verification records. Redis is for caching/short-lived coordination only; never sole record of important results.
- Observability: structured logs, run IDs, node/tool timing, token/cost metadata where available, error categories, source freshness and agent trace. Avoid logging personal health details.

### Agent roles (each has defined contract and tools)
1. Orchestrator / Planner: clarifies objective, scope, plans steps and routes.
2. Atmosphere & Data Agent: obtains observations, validates freshness/coverage, summarizes pollutant/weather state.
3. Hotspot Agent: finds temporal/spatial anomalies only when data density supports it; reports limitations.
4. Source Investigation Agent: compares candidate sources (traffic, construction dust, industrial activity, waste burning, biomass/household combustion) against evidence; produces ranked hypotheses, not definitive attribution.
5. Exposure & Protection Agent: contextualizes exposure pathways and practical protections for households, schools, outdoor workers; not medical diagnosis.
6. Intervention Strategist: proposes feasible options, co-benefits, tradeoffs, responsible actor and measurable KPIs.
7. Scenario / Impact Agent: calculates scenario ranges from explicit deterministic models and inputs; LLM may explain but must not invent numeric results.
8. Verification Agent: compares baseline and post-action data, checks quality, confounders and predeclared metrics; returns verified / inconclusive / not verified.
9. Civic Action Agent: drafts municipal briefs, tasks, notices and engagement plans. External execution is approval-gated.

## LangGraph workflow
1. Parse objective and required location/time window.
2. Validate scope and consent/permissions.
3. Retrieve observations and weather; record source, station, timestamps, data quality.
4. Run deterministic quality checks.
5. Detect hotspot/anomaly only if sufficient observations.
6. Investigate multiple source hypotheses; request more data when evidence is insufficient.
7. Assess exposed groups and pathways using bounded, non-diagnostic guidance.
8. Generate intervention candidates with costs, feasibility, responsible parties and KPIs.
9. Run deterministic what-if models; produce ranges and assumptions.
10. Rank options with configurable criteria; expose trade-offs.
11. Produce evidence-linked recommendation and human-readable report.
12. For civic action, pause for human approval.
13. Record implementation evidence and follow-up measurement plan.
14. Verify outcome; label result and update the impact ledger.

## Shared state / trace
Each run should include run_id, goal, location, time_window, observations, data_quality, evidence[], source_hypotheses[], exposure_context, intervention_candidates[], scenario_results[], recommendation, approvals, tasks, verification, status, trace_events[] and error details.

Each trace event: timestamp, node/agent, status, tool name (if any), sanitized inputs summary, output summary, source references, latency, retry/error, and confidence rationale. Do not expose private chain-of-thought. Show concise rationale, evidence, tool events and decisions instead.

## Intervention and scenario principles
- Start with a small number of transparent, defensible scenarios: traffic volume/time changes; construction dust controls; waste-burning prevention where evidence exists; school/outdoor scheduling; household filtration/ventilation; community transport.
- Separate emissions from ambient concentration and personal exposure. Do not convert one into another without a validated model.
- Results must include baseline, scenario, units, assumptions, uncertainty/range, source of factors, sensitivity and limitations.
- If a model/data is unavailable, return qualitative assessment or “insufficient evidence”, not fabricated percentages.
- User/municipal intervention impact is not verified until follow-up observations and confounder checks are available.

## Security and enterprise readiness
- Validate all user inputs; rate limit sensitive/expensive endpoints.
- JWT secrets must be mandatory outside development; rotate; no insecure default.
- Scope conversation, investigation and civic-task access by user/organization role.
- RBAC roles: resident, community coordinator, analyst, municipal operator, reviewer/admin.
- Do not automatically send alerts, publish notices, contact officials, or change infrastructure. Require approval.
- PII minimization; separate household/health profile data from public community analytics.
- Audit log for actions, approval and edits; configurable retention.
- Health/environmental recommendations use authoritative references where available, disclose uncertainty, and avoid diagnosis.

## UI direction
The primary experience is a command-and-control environmental intelligence workspace, not a chat-first UI:
- City/Community Overview: map/area selector, observed AQI/pollutants, freshness, stations, trends, weather, data-quality panel.
- Investigation Workbench: incident, evidence timeline, candidate source hypotheses, confidence and gaps.
- Intervention Lab: baseline vs alternatives, ranges, costs, feasibility, tradeoffs, assumptions.
- Civic Action Center: proposed → approved → assigned → in progress → evidence submitted → verified/inconclusive.
- Exposure & Routine: household/community context, recommendations and schedule.
- Impact Observatory: measured trends vs estimated benefits vs verified outcomes.
- Agent Trace: visible workflow stages, agents/tools, evidence references, durations, statuses, decisions. Never display hidden chain-of-thought.

## Implementation phases and acceptance criteria
### Phase 0 — Trust & baseline
- Remove fabricated fallback values from live-facing UI/API/agent paths.
- Add explicit data status/provenance contracts and stale-data states.
- Label demo fixtures, separate from live sources.
- Fix default-city assumptions and ensure source errors are actionable.
- Add tests for source unavailable, missing pollutant fields, stale readings and demo-mode separation.

### Phase 1 — Intelligence foundations
- Introduce typed domain contracts and normalized source adapters.
- Add data quality/freshness evaluation.
- Add deterministic hotspot/stagnation analytics with tests.
- Persist run, evidence and trace structures.

### Phase 2 — Agent graph
- Replace one ReAct loop with LangGraph orchestration.
- Implement nodes and tool contracts; conditional routes, bounded retries and structured output.
- Add trace API/UI and failure/degraded modes.
- Unit/integration tests with fake adapters and recorded fixtures.

### Phase 3 — Investigation & intervention
- Source hypotheses with evidence citations and alternatives.
- Intervention catalog and ranking.
- Scenario lab with explicit models and assumptions.
- Reports as structured outputs and rendered UI.

### Phase 4 — Civic operations & verification
- RBAC and organization/community scopes.
- Approval-gated tasks, assignment and evidence upload.
- Baseline/post measurements, verification status and audit trail.

### Phase 5 — Evaluation & demo
- Eval set for factuality, source grounding, tool choice, uncertainty, safety, latency and failure recovery.
- End-to-end reproducible scenario using labelled fixture data if live coverage is absent.
- Demo must never misrepresent simulated data as current sensor observations.

## Engineering process
- Work in feature branches; never force-push or directly rewrite main.
- Make small commits and run tests/build at every checkpoint.
- Inspect repository conventions before editing.
- Keep API migrations backward-compatible where feasible; document breaking changes.
- No fake claims, hardcoded city-specific readings, or unvalidated health/emissions metrics.
