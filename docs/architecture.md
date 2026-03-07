# Architecture

## Overview
This project is a single-page React app (Vite) that demonstrates Salesforce-backed SSO with two login modes:
- `internal`: OIDC redirect through Salesforce internal domain
- `portal`: OAuth authorization init through Experience Cloud site auth endpoint

The app then displays user identity claims and uses the access token to call Salesforce REST APIs.

## Stack
- React 19 + Vite 7
- `oidc-client-ts` for internal OIDC redirect/callback flow
- Native `fetch` for portal token exchange and Salesforce API calls
- `react-router-dom` for routing (`/` and `/callback`)

## Runtime Flow
1. User lands on `/`.
2. App resolves mode from querystring (`mode=portal` or default `internal`).
3. For `internal` mode:
   - App checks existing user via `internalUserManager.getUser()`.
   - If not authenticated, redirects with `signinRedirect()`.
4. For `portal` mode:
   - App checks `sessionStorage.portal_user`.
   - If absent, redirects browser to Experience Cloud `auth/oauth/<provider>` URL.
5. Salesforce redirects to `/callback` with auth response.
6. Callback behavior:
   - `internal`: handled by `signinRedirectCallback()`.
   - `portal`: code is exchanged at Salesforce token endpoint, then user profile is fetched from `id` URL.
7. App stores session data in `sessionStorage` and renders `Dashboard`.

## Key Files
- `src/App.jsx`: mode selection + initial redirect logic
- `src/pages/Callback.jsx`: callback completion logic for both modes
- `src/pages/Dashboard.jsx`: profile rendering, logout, and Salesforce data demo
- `src/auth/internalAuth.js`: internal OIDC user manager config
- `src/auth/portalAuth.js`: portal auth constants/endpoints

## Session Model
- Storage: `window.sessionStorage`
- Keys used:
  - `login_mode`
  - `portal_user`
  - `accounts_cache` (cleared on logout)
- Token persistence is browser-session scoped.

## Logout Behavior
- `Logout React Only`: clears local session data and re-enters selected mode.
- `Logout React + Salesforce`: clears local data and sends user to Salesforce logout endpoint with `retUrl`.

## Data Access Demo
Dashboard issues a Salesforce REST query using the returned access token:
- Query: `SELECT Id, Name FROM Account ORDER BY Name LIMIT 10`
- REST base URL is taken from `user.profile.urls.rest` with API version replacement.

## Current Technical Debt
- Auth configuration values are hardcoded in source files.
- Portal callback flow is manual and does not implement a full PKCE/state workflow.
- No explicit automated tests for auth callback branches.

Recommended next step is migrating auth config to `.env` variables and adding callback flow tests.
