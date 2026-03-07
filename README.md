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
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open:
   - Internal mode: `http://localhost:5173/?mode=internal`
   - Portal mode: `http://localhost:5173/?mode=portal`

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
- Current auth values are hardcoded for demo; move to environment variables for production.
