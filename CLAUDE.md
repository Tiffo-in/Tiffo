# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tiffo is a tiffin (meal subscription) service platform connecting customers with local tiffin providers ("partners"). The repo is a monorepo containing five independent projects (no npm/yarn workspaces — each has its own `node_modules` and lockfile):

- `backend/` — Express + MongoDB/Mongoose REST API (also serves Socket.io realtime)
- `frontend/` — React 18 + Vite web app (customer, partner, and admin dashboards in one app, split by route)
- `mobile/` — Expo/React Native customer app
- `mobile-partner/` — Expo/React Native partner app
- `shared-mobile/` — plain local package (not published, not a workspace) sharing an Axios client and Socket.io client between `mobile` and `mobile-partner`, linked via hand-rolled Metro `watchFolders`/`extraNodeModules` + TS `paths`, not `npm link`/workspaces

## Common commands

### Root
```bash
npm run dev           # runs backend (nodemon) + frontend (vite) concurrently
npm run install-all   # installs root, backend, frontend deps
```

### Backend (`cd backend`)
```bash
npm run dev                                          # nodemon src/app.js
npm test                                              # jest, all tests
npx jest src/controllers/__tests__/authController.test.js   # single test file
npx jest -t "test name"                               # single test by name
npm run lint                                          # eslint src
npm run format                                        # prettier --write "src/**/*.{js,json}"
```
Requires a `.env` (see `.env.example`) — `validateEnv.js` fails fast if required vars are missing (Mongo URI, JWT secret; stricter set in production e.g. Razorpay keys, `FRONTEND_URL`).

### Frontend (`cd frontend`)
```bash
npm start             # vite dev server (proxies /api -> http://localhost:5001)
npm run build          # vite build -> build/ (served by nginx in Docker)
npm run lint           # eslint src
npm run format         # prettier --write
npx cypress open       # e2e tests (frontend/cypress/e2e) — no npm script wired up
```
Uses `REACT_APP_*` env var names (CRA convention) even though the bundler is Vite — a `vite-plugin-env-compatible` shim makes this work.

### Mobile apps (`cd mobile` or `cd mobile-partner`)
```bash
npm run start          # expo start
npm run android/ios    # mobile: expo start --android/ios; mobile-partner: expo run:android/ios (native build)
npm run lint            # eslint src
```
`eas-build-pre-install` (run automatically by EAS, not locally) installs `shared-mobile`'s deps — if you change `shared-mobile/`, run `npm install --legacy-peer-deps` inside it manually for local dev.

### CI
GitHub Actions (`.github/workflows/ci.yml`, `pr-checks.yml`) run on every PR: backend lint + `npm test`, frontend lint + `npm run build`, then a Docker build-validation pass on both Dockerfiles. Match these locally before pushing. Pre-commit hook (`.husky/pre-commit`) runs `lint-staged` in backend, frontend, mobile, and mobile-partner.

## Architecture

### Backend (`backend/src`)
- `app.js` — bootstraps Express wrapped in `http.createServer` (for Socket.io), in this middleware order: `compression` → `helmet` → CORS allowlist → rate limiter → **raw-body webhook route mounted before `express.json()`** (Razorpay HMAC verification needs raw bytes) → `express.json`/`urlencoded` → `cookieParser` → CSRF → mongo-sanitize → inline XSS sanitizer → ~20 route modules → Swagger docs (`/api/docs`) → health check → Sentry/error handlers.
- `config/database.js` — connects Mongo and runs idempotent startup migrations on every boot (backfilling `isEmailVerified`, generating missing Tiffin slugs, seeding default Banners).
- `controllers/`, `routes/`, `middlewares/`, `models/`, `services/` — one file per resource, thin routes delegate to controllers. `controllers/admin/` holds admin-only controllers separately.
- Auth: JWT read from httpOnly cookie or `Authorization: Bearer`; `middlewares/auth.js` exposes `protect` (verifies + loads `req.user`, checks `isActive`/ban state) and `authorize(...roles)`. Roles are `user`/`partner`/`admin`. `middlewares/adminAuth.js` adds `superAdminAuth` for `isSuperAdmin`-gated routes. CSRF is double-submit-cookie based (`middlewares/csrf.js`).
- Rate limiting: Upstash Redis sliding-window limiter in production, falls back to in-memory `express-rate-limit` when Upstash env vars are absent; fails open on Redis errors.
- Realtime: `services/socketService.js` — JWT-authenticated Socket.io handshake (allows anonymous "guest" connections), tracks connected users in an in-memory Map.
- Recurring perf/security learnings are tracked in `.jules/bolt.md` and `.jules/sentinel.md` — read these before touching controllers with DB queries or user input, they capture concrete past incidents (N+1 queries, ReDoS via unsanitized regex, XSS via `dangerouslySetInnerHTML`) and the fixes expected going forward.

### Frontend (`frontend/src`)
- `App.jsx` — `HelmetProvider > ThemeProvider > Redux Provider > SocketProvider > Router`; all page components are `React.lazy`-loaded behind a class-based `ErrorBoundary` (reports to Sentry). `SessionHydrator` calls `GET /auth/me` on mount to restore Redux auth state from the httpOnly cookie.
- Routing is split three ways: public routes, authenticated-user routes (`ProtectedRoute`), partner routes under `/partner/*` and admin routes under `/admin/*` (both via `RoleRoute({ role })`, checked against `state.auth.user.role`).
- `services/api.js` — single axios instance, `withCredentials: true` (cookie auth, no bearer token in JS), request interceptor attaches `X-CSRF-Token` from the `csrf_token` cookie on mutating requests, response interceptor redirects to `/login` on 401. Domain services (`authService`, `partnerService`, etc.) wrap this instance.
- State: Redux Toolkit (`store/slices/{auth,tiffin,subscription,customer}Slice.js`) is the real global state layer. `@tanstack/react-query` is an installed-but-unused dependency — don't assume it's wired up anywhere.
- Styling: Tailwind CSS (`darkMode: 'class'`, brand palette defined in `tailwind.config.js`) + Headless UI + Framer Motion.

### Mobile (`mobile/src`, `mobile-partner/src`)
- Both apps: Expo + React Navigation v6 (bottom-tabs nesting native-stack), TypeScript strict mode, `contexts/AuthContext` for session state, TanStack Query for server state.
- `mobile/` is the customer app: browse/subscribe/checkout, Razorpay payments (`react-native-razorpay`), location (`expo-location`), push notifications (`expo-notifications` + `services/notificationService.ts`), plus an `AlertContext`.
- `mobile-partner/` is the partner operations app: dashboard, orders, menu/tiffin management, earnings, and a nested profile stack (business profile, bank/payment details, tax documents, partner agreement). No location/push/payment deps at this layer.
- Both import the shared Axios/Socket.io client from `shared-mobile/src` (`createApi(tokenKey, userKey)`, `initSocket(tokenKey)`), using different AsyncStorage key names per app (e.g. `auth_token` vs `partner_auth_token`) so both apps' sessions can coexist on one device during development.
- The backend base URL is currently hardcoded to `https://api.tiffo.in` in `shared-mobile` (no dev/staging switch is actually wired up despite `expo-constants`/`__DEV__` being imported) — point at a local backend by editing `shared-mobile/src/services/api.ts` directly during local development, and revert before committing.

## Deployment

`cloudbuild.yaml` builds and deploys `backend` and `frontend` as separate Docker images to Cloud Run (`us-central1`) via Google Cloud Build. Backend Dockerfile is `node:22-alpine` running `npm start`. Frontend Dockerfile multi-stage builds with Vite then serves the `build/` output via `nginx:alpine`. Mobile apps deploy via EAS (`eas.json` in each app, separate EAS `projectId` per app).
