# AGENTS.md

## Purpose
This repository is the single source of truth for the React + Salesforce SSO demo.
Do not split this into multiple repos.

## Working Agreement
- Keep all app, auth, and documentation changes in this repo.
- Update docs when auth flow, Salesforce settings, or environment assumptions change.
- Prefer small, reviewable commits.
- Do not hardcode new secrets; use environment variables for anything sensitive.

## Repo Layout
- `src/` application code
- `src/auth/` Salesforce OIDC and portal auth configuration
- `src/pages/` app entry views (`Dashboard`, `Callback`)
- `docs/architecture.md` technical architecture and flow
- `docs/salesforce-setup.md` Salesforce org and connected app setup

## Local Development
- Install: `npm install`
- Run: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Documentation Rules
When changing authentication behavior, update both:
1. `docs/architecture.md`
2. `docs/salesforce-setup.md`

## Current Scope
- One React app with two auth modes:
  - Internal Salesforce login (`?mode=internal`)
  - Experience Cloud portal login (`?mode=portal`)
- Callback handled at `/callback`
