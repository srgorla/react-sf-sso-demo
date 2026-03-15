# React Salesforce SSO Demo

Single-repo React + Vite proof of concept for Salesforce-backed authentication.

This app supports two sign-in modes:
- `internal`: Salesforce internal domain login
- `portal`: Experience Cloud site login flow

## Docs
- Architecture: [`docs/architecture.md`](docs/architecture.md)
- Salesforce setup: [`docs/salesforce-setup.md`](docs/salesforce-setup.md)
- Repo working rules: [`AGENTS.md`](AGENTS.md)

## Tech Stack
- React 19
- Vite 7
- `oidc-client-ts`
- `react-router-dom`

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an org-specific local env file from `.env.example`:
   ```bash
   cp .env.example .env.uat.local
   ```
   or
   ```bash
   cp .env.example .env.agentforce.local
   ```
3. Start the matching dev server:
   ```bash
   npm run dev:uat
   ```
4. Open:
   - Internal mode: `http://localhost:5173/?mode=internal`
   - Portal mode: `http://localhost:5173/?mode=portal`

For ngrok or another tunnel:
- Put the org-specific tunnel hostname in the matching mode-local file, for example `.env.uat.local` or `.env.agentforce.local`, then run `npm run dev:uat` or `npm run dev:agentforce`.
- By default, callback and post-logout URLs follow the active browser origin, so the same app build can run on localhost or a tunnel URL. Salesforce Connected App callback URLs still need to match the active public URL exactly.

For Vercel hosted testing:
- Keep localhost and ngrok for local development; use Vercel as an additional stable hosted origin.
- Add the Vercel production callback URL to the Salesforce Connected App allowlist, for example `https://<your-vercel-app>.vercel.app/callback`.
- Configure the same `VITE_*` auth settings in the Vercel project. Set fixed redirect/logout URLs there if you want Salesforce to always return to the Vercel deployment.
- This repo includes [`vercel.json`](vercel.json) so Vercel rewrites SPA routes such as `/callback` to `index.html`.

## Vercel Checklist
1. Import this repo into Vercel and point the project at branch `feat/vercel-hosting` while you test.
2. Confirm Vercel uses `npm run build` and `dist`.
3. Add these project environment variables:
   - `VITE_SF_INTERNAL_AUTHORITY`
   - `VITE_SF_INTERNAL_CLIENT_ID`
   - `VITE_SF_INTERNAL_SCOPE`
   - `VITE_SF_PORTAL_CLIENT_ID`
   - `VITE_SF_PORTAL_SCOPE`
   - `VITE_SF_PORTAL_OAUTH_INIT_URL`
   - `VITE_SF_PORTAL_APPEND_STANDARD_PARAMS`
   - `VITE_SF_PORTAL_VALIDATE_STATE`
   - `VITE_SF_PORTAL_TOKEN_URL`
   - `VITE_SF_PORTAL_LOGOUT_URL`
4. Optional but recommended for hosted stability:
   - `VITE_APP_REDIRECT_URI=https://<your-vercel-app>.vercel.app/callback`
   - `VITE_INTERNAL_POST_LOGOUT_REDIRECT_URI=https://<your-vercel-app>.vercel.app/?mode=internal`
   - `VITE_PORTAL_POST_LOGOUT_REDIRECT_URI=https://<your-vercel-app>.vercel.app/?mode=portal`
5. In Salesforce, add the Vercel callback URL to the same Connected App allowlist that already contains localhost and ngrok.
6. Deploy and test:
   - `https://<your-vercel-app>.vercel.app/?mode=internal`
   - `https://<your-vercel-app>.vercel.app/?mode=portal`
   - direct callback handling on `/callback`

## Environment Modes
- `.env.local`: shared fallback values only
- `.env.uat.local`: UAT Salesforce + tunnel settings
- `.env.agentforce.local`: Agentforce Salesforce + tunnel settings
- `npm run dev`: start Vite with default env loading
- `npm run dev:local`: start normal local development
- `npm run dev:uat`: start Vite in `uat` mode
- `npm run dev:agentforce`: start Vite in `agentforce` mode
- `npm run dev:ngrok`: legacy generic tunnel mode using `.env.ngrok`
- Vercel production: set `VITE_*` variables in the Vercel dashboard for a stable hosted deployment

## Scripts
- `npm run dev` start dev server
- `npm run build` production build
- `npm run preview` preview build output
- `npm run lint` run ESLint

## Authentication Flow Summary
- App entry is `/`.
- Callback route is `/callback`.
- Internal mode uses `oidc-client-ts` redirect + callback processing.
- Portal mode performs Salesforce token exchange in callback logic.
- On success, dashboard renders user claims and can query Salesforce Accounts.

## Configuration Files
- Internal auth settings: `src/auth/internalAuth.js`
- Portal auth settings: `src/auth/portalAuth.js`
- Callback handling: `src/pages/Callback.jsx`

## Important Notes
- Keep this as a **single repo** for app + docs.
- Do not commit production secrets.
- This app reads auth settings from `VITE_*` env vars (see `.env.example`).
- Do not put OAuth client secrets in frontend `VITE_*` vars; Vite exposes them to the browser bundle.
- For portal mode, use the Experience Cloud `/services/oauth2/authorize` endpoint in `VITE_SF_PORTAL_OAUTH_INIT_URL`.
