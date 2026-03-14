# Salesforce Setup

## Goal
Configure Salesforce so this app can authenticate users in two ways:
- Internal Salesforce login (`mode=internal`)
- Experience Cloud site login via Auth Provider (`mode=portal`)

## Prerequisites
- A Salesforce org with My Domain enabled
- Experience Cloud site created and published
- Access to Setup for Connected Apps, Auth Providers, and OAuth settings
- Local or public app callback URL available
- Local env file configured from `.env.example`:
  - `cp .env.example .env.local`

## 1) Create Connected Apps
Create two connected apps if you want separate client IDs per mode (recommended), or one app if policy allows.

For each connected app:
1. Enable OAuth settings.
2. Callback URL: exact app callback URL, for example:
   - Local Vite: `http://localhost:5173/callback`
   - ngrok: `https://<your-ngrok-subdomain>.ngrok-free.app/callback`
3. Selected OAuth scopes should include:
   - `openid`
   - `profile`
   - `email`
   - `api`
   - `id`
4. Save and note Consumer Key (client ID).

Map resulting values to your active env mode file, for example `.env.uat.local` or `.env.agentforce.local`:
- `VITE_SF_INTERNAL_CLIENT_ID`
- `VITE_SF_PORTAL_CLIENT_ID`

## 2) Internal Mode Configuration
Update your active env mode file:
- `VITE_SF_INTERNAL_AUTHORITY`: your Salesforce My Domain base URL
- `VITE_APP_REDIRECT_URI`: optional fixed callback URL override
- `VITE_INTERNAL_POST_LOGOUT_REDIRECT_URI`: optional fixed app URL for internal mode logout
- `VITE_SF_INTERNAL_SCOPE`: internal requested scopes

If `VITE_APP_REDIRECT_URI` and the post-logout URL override are omitted, the app defaults them from the current browser origin. That means `http://localhost:5173` and an ngrok URL can use the same build, but Salesforce Connected App callback settings must still match the active public URL exactly.

In Salesforce My Domain Authentication Configuration:
- Enable the login methods you want users to choose from (for example Salesforce username/password and one or more SSO options).
- Avoid org settings that force immediate redirect to a single Auth Provider if you want users to decide on the login page.

Example authority shape:
- `https://<my-domain>.my.salesforce.com`

## 3) Experience Cloud (Portal) Mode Configuration
In Salesforce Experience Cloud:
1. Configure the Auth Provider used by the site login (for example Google).
2. Copy the generated auth init URL from the site/provider setup.

Update your active env mode file:
- `VITE_SF_PORTAL_OAUTH_INIT_URL`: exact site OAuth authorize URL from Salesforce (including the correct Experience Cloud site path), e.g. `/customer/services/oauth2/authorize`
- `VITE_SF_PORTAL_SCOPE`: OAuth scopes to request (start with `openid profile email`; add `api` only if your Connected App allows it)
- `VITE_SF_PORTAL_APPEND_STANDARD_PARAMS`: set to `true` when using `/services/oauth2/authorize`
- `VITE_SF_PORTAL_TOKEN_URL`: Salesforce token endpoint
- `VITE_APP_REDIRECT_URI`: optional fixed callback URL override
- `VITE_PORTAL_POST_LOGOUT_REDIRECT_URI`: optional fixed app URL for portal mode logout
- `VITE_SF_PORTAL_LOGOUT_URL`: Experience Cloud site logout endpoint, e.g. `/customer/secur/logout.jsp`
  - For portal mode, prefer site logout without external `retUrl` when testing on localhost to avoid Experience Cloud "Invalid Page Redirection" blocks.

Expected endpoint shape:
- Auth init: `https://<site-domain>/<site-path>/services/oauth2/authorize`
- Token: `https://<my-domain>.my.salesforce.com/services/oauth2/token`

## 4) Redirect URI and CORS Checks
Verify in Salesforce:
- Connected App callback URL exactly matches the URL your users will hit, including ngrok hostname when tunneling
- CORS/allowlist policy permits local development origin if required by org policy
- Connected App policy aligns with PKCE-required flows (this app now sends `code_challenge` on authorize and `code_verifier` on token exchange)

For ngrok/Vite local development, update the active env mode file with the tunnel hostname if Vite blocks the request:
- `VITE_ALLOWED_HOSTS=<your-ngrok-subdomain>.ngrok-free.app`
- Start Vite with the matching mode, for example `npm run dev:uat` or `npm run dev:agentforce`

## 5) Test Matrix
Run local app and validate:
1. `http://localhost:5173/?mode=internal`
2. `http://localhost:5173/?mode=portal`
3. Callback handling on `/callback`
   - If token/profile calls are blocked by policy/CORS, callback now surfaces endpoint-specific failure detail in the UI.
4. Dashboard loads profile claims
5. `Fetch Accounts` succeeds with returned token
6. Both logout actions behave as expected
   - `Logout React Only` should land on `/?mode=<mode>&logged_out=1` and keep user signed out in React until `Sign In Again` is clicked
   - Launching React again from Experience Cloud link (without `logged_out=1`) should auto-login if Salesforce session is still active
   - `Logout React + Salesforce` should end both Salesforce and React sessions
7. Open a second tab with the same mode and confirm it reuses existing auth session without a new Google prompt (until token expiry/logout)

## Security Notes
- Do not commit production client secrets.
- Do not place OAuth client secrets in frontend `VITE_*` env vars; they are bundled to the browser.
- Keep this demo on localhost-only credentials where possible.
- Keep `client_secret` on a backend token-exchange service if required by policy.
- This app now uses `localStorage` for cross-tab session reuse; clear storage on shared machines and keep token lifetimes appropriately short.
