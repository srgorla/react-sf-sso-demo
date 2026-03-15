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
3. The app derives its default callback and post-logout URLs from `window.location.origin`, so the same build can run on localhost, a tunnel URL such as ngrok, or a hosted origin such as Vercel without code changes.
4. For `internal` mode:
   - App checks existing user via `internalUserManager.getUser()`.
   - If not authenticated, redirects with `signinRedirect()` and lets Salesforce present configured login choices (for example username/password or SSO provider).
5. For `portal` mode:
   - App checks `localStorage.portal_user`.
   - If absent, redirects browser to configured Experience Cloud auth init URL.
   - Current repo behavior uses Experience Cloud `/services/oauth2/authorize` and appends OAuth + PKCE params (`client_id`, `redirect_uri`, `response_type=code`, `code_challenge`, `code_challenge_method=S256`, `state`).
   - `scope` is only sent when explicitly configured in `portalAuthConfig.scope` to avoid connected-app scope mismatches.
6. Salesforce redirects to `/callback` with auth response.
7. Callback behavior:
   - `internal`: handled by `signinRedirectCallback()`.
   - `portal`: code is exchanged at Salesforce token endpoint (with PKCE verifier). Callback tries configured org token URL first, then Experience Cloud-derived token URLs when available.
   - `portal`: user profile is fetched from returned identity/userinfo URLs with endpoint fallback.
8. App stores long-lived user session data in `localStorage` and renders `Dashboard`.

## Key Files
- `vite.config.js`: Vite dev server host/port/allowed host overrides for localhost and tunnel access
- `src/App.jsx`: mode selection + initial redirect logic
- `src/pages/Callback.jsx`: callback completion logic for both modes
- `src/pages/Dashboard.jsx`: profile rendering, logout, and Salesforce data demo
- `src/auth/internalAuth.js`: internal OIDC user manager config
- `src/auth/portalAuth.js`: portal auth constants/endpoints
- `src/auth/appUrls.js`: runtime app-origin helpers for callback/logout defaults
- `.env.example`: environment variable template for org-specific auth settings
- `.env.uat.local` / `.env.agentforce.local`: primary local env files for the supported Salesforce org modes
- `vercel.json`: SPA rewrite for hosted deployments so deep links such as `/callback` resolve to `index.html`

## Supported Origins
- `http://localhost:5173` for normal local development
- `https://<ngrok-subdomain>.ngrok-free.app` for public callback testing into the local Vite server
- `https://<your-project>.vercel.app` (or a custom domain) for stable hosted testing

Because redirect URIs default from the active browser origin, the frontend can support all of those origins simultaneously. The governing constraint is Salesforce configuration: every origin-specific `/callback` URL must be allowlisted in the relevant Connected App, or you must use separate Connected Apps per environment.

## Hosted Deployment Notes
- Vercel works for this repo without changing auth logic because the app already computes callback and post-logout URLs from the active origin unless fixed `VITE_*` overrides are provided.
- Hosted SPA routing still needs a platform rewrite for `BrowserRouter`; this repo uses `vercel.json` to rewrite all requests to `index.html` so `/callback` can load directly after Salesforce redirects back.
- For OAuth testing, prefer one stable Vercel production URL or a custom domain. Vercel preview URLs are not a good default for Salesforce redirect URIs because the exact callback URL must be registered ahead of time.

## Session Model
- Storage:
  - `window.localStorage` for authenticated user session (`oidc-client-ts` user + `portal_user`) so sessions are shared across tabs.
  - `window.sessionStorage` for transient flow state (`login_mode`, `accounts_cache`).
- Keys used:
  - `login_mode`
  - `portal_user`
  - `portal_pkce_verifier` (PKCE verifier for portal token exchange)
  - `portal_auth_state` (portal state validation)
  - `react_only_logout_mode` (blocks auto-login after React-only logout until user clicks sign-in)
  - `accounts_cache` (cleared on logout)
- Auth session persistence is browser-profile scoped until token expiry or logout.

## Logout Behavior
- `Logout React Only`: clears local session data, records `react_only_logout_mode`, and redirects to `/?mode=<mode>&logged_out=1` so the app stays on a signed-out screen until `Sign In Again`.
- A fresh launch without `logged_out=1` (for example from Experience Cloud home link) clears stale React-only logout flag and can auto-authenticate again if Salesforce session is still active.
- `Logout React + Salesforce`: clears local data and sends user to mode-specific Salesforce logout endpoint.
- Internal mode uses `retUrl` back to the React app.
- Portal mode uses Experience Cloud site logout URL without external `retUrl` because Experience Cloud can block redirects to outside domains (for example `localhost`) with "Invalid Page Redirection".

## Data Access Demo
Dashboard issues a Salesforce REST query using the returned access token:
- Query: `SELECT Id, Name FROM Account ORDER BY Name LIMIT 10`
- REST base URL is taken from `user.profile.urls.rest` with API version replacement.

## Current Technical Debt
- Frontend-only portal callback/token exchange can be limited by org CORS/policy and is better handled via backend.
- Portal callback flow is manual (no backend proxy), though PKCE/state are now implemented.
- No explicit automated tests for auth callback branches.

Recommended next step is adding callback flow tests and (optionally) a backend token-exchange endpoint.
