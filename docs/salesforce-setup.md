# Salesforce Setup

## Goal
Configure Salesforce so this app can authenticate users in two ways:
- Internal Salesforce login (`mode=internal`)
- Experience Cloud site login via Auth Provider (`mode=portal`)

## Prerequisites
- A Salesforce org with My Domain enabled
- Experience Cloud site created and published
- Access to Setup for Connected Apps, Auth Providers, and OAuth settings
- Local app callback URL available (default in repo: `http://localhost:5173/callback`)

## 1) Create Connected Apps
Create two connected apps if you want separate client IDs per mode (recommended), or one app if policy allows.

For each connected app:
1. Enable OAuth settings.
2. Callback URL: `http://localhost:5173/callback`
3. Selected OAuth scopes should include:
   - `openid`
   - `profile`
   - `email`
   - `api`
   - `id`
4. Save and note Consumer Key (client ID).

Map resulting client IDs to:
- `src/auth/internalAuth.js` -> `internalAuthConfig.clientId`
- `src/auth/portalAuth.js` -> `portalAuthConfig.clientId`

## 2) Internal Mode Configuration
Update `src/auth/internalAuth.js`:
- `authority`: your Salesforce My Domain base URL
- `redirectUri`: local callback URL
- `postLogoutRedirectUri`: local app URL for internal mode

Example authority shape:
- `https://<my-domain>.my.salesforce.com`

## 3) Experience Cloud (Portal) Mode Configuration
In Salesforce Experience Cloud:
1. Configure the Auth Provider used by the site login (for example Google).
2. Copy the generated auth init URL from the site/provider setup.

Update `src/auth/portalAuth.js`:
- `oauthInitUrl`: exact site auth URL, e.g. `/services/auth/oauth/<provider>`
- `tokenUrl`: Salesforce token endpoint
- `redirectUri`: local callback URL
- `postLogoutRedirectUri`: local app URL for portal mode

Expected endpoint shape:
- Auth init: `https://<site-domain>/<site-path>/services/auth/oauth/<provider>`
- Token: `https://<my-domain>.my.salesforce.com/services/oauth2/token`

## 4) Redirect URI and CORS Checks
Verify in Salesforce:
- Connected App callback URL exactly matches `http://localhost:5173/callback`
- CORS/allowlist policy permits local development origin if required by org policy

## 5) Test Matrix
Run local app and validate:
1. `http://localhost:5173/?mode=internal`
2. `http://localhost:5173/?mode=portal`
3. Callback handling on `/callback`
4. Dashboard loads profile claims
5. `Fetch Accounts` succeeds with returned token
6. Both logout actions behave as expected
7. Open a second tab with the same mode and confirm it reuses existing auth session without a new Google prompt (until token expiry/logout)

## Security Notes
- Do not commit production client secrets.
- Keep this demo on localhost-only credentials where possible.
- Move client IDs and URLs to environment variables before production use.
- This app now uses `localStorage` for cross-tab session reuse; clear storage on shared machines and keep token lifetimes appropriately short.
