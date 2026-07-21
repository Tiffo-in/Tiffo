# Tiffo

A tiffin (meal subscription) platform connecting customers with local home-chef tiffin providers — browse, subscribe, pay, and track daily deliveries.

[Live site](https://tiffo.in) · [API docs (Swagger)](https://api.tiffo.in/api/docs)

## Features

- Browse verified tiffin services by cuisine, meal type, dietary preference, and location
- Daily / weekly / monthly subscriptions with Razorpay payments and automated delivery scheduling
- Partner dashboard: menus, orders, earnings, ad campaigns, payout details
- Admin console: users, partners, payments, deliveries, fraud reports, banners, blog
- Realtime order/delivery updates over Socket.io, transactional email via Resend
- Customer and partner mobile apps (Expo / React Native)

## Repository layout

This is a monorepo of five independent projects — **no npm workspaces**; each has its own `node_modules` and lockfile:

| Directory | What it is | Stack |
|---|---|---|
| `backend/` | REST API + Socket.io realtime | Express 4, MongoDB/Mongoose, JWT (httpOnly cookie), Razorpay |
| `frontend/` | Customer + partner + admin web app | React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion |
| `mobile/` | Customer app | Expo, React Navigation, TanStack Query |
| `mobile-partner/` | Partner operations app | Expo, React Navigation, TanStack Query |
| `shared-mobile/` | Shared Axios/Socket.io client for both mobile apps | Linked via Metro `watchFolders`, not npm link |

## Quickstart (web)

```bash
git clone <repo-url> && cd TIFFOwebsite
npm run install-all                # root + backend + frontend deps

cp backend/.env.example backend/.env    # fill in values (see table below)
cp frontend/.env.example frontend/.env

npm run dev                        # backend (nodemon) + frontend (vite) concurrently
```

Frontend dev server proxies `/api` to the local backend. The backend fails fast at boot if required env vars are missing (`backend/src/utils/validateEnv.js`).

### Backend environment variables

| Variable | Purpose | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | always |
| `JWT_SECRET` / `JWT_EXPIRE` | Auth token signing (32+ chars) | always |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email | always |
| `FRONTEND_URL` / `BACKEND_URL` | CORS allowlist + email links | production |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Payments + webhook HMAC | production |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting | recommended |
| `CLOUDINARY_*` | Image uploads | recommended |
| `GOOGLE_CLIENT_ID` | Google Sign-In audience verification | recommended |
| `SENTRY_DSN` | Error reporting | optional |

See [backend/.env.example](backend/.env.example) for the full list with sample values.

## Common commands

```bash
# Backend (cd backend)
npm run dev        # nodemon
npm test           # jest
npm run lint       # eslint

# Frontend (cd frontend)
npm start          # vite dev server
npm run build      # production build
npm run lint       # eslint

# Mobile (cd mobile / mobile-partner)
npm run start      # expo start
```

## Architecture

Client apps (web + 2 mobile) → Express REST API (`/api/*`) → MongoDB. Payments flow through Razorpay with a raw-body HMAC-verified webhook; realtime events go over a JWT-authenticated Socket.io channel. Full map: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Deployment: Google Cloud Build (`cloudbuild.yaml`) ships backend and frontend as separate Docker images to Cloud Run; mobile apps ship via EAS.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system components and data flow
- [docs/API.md](docs/API.md) — API surface overview (live Swagger at `/api/docs`)
- [docs/CODE_REVIEW.md](docs/CODE_REVIEW.md) — July 2026 full-codebase review: security, quality, UI/UX findings and improvement plan
- [CLAUDE.md](CLAUDE.md) — working-in-this-repo guide (commands, conventions, gotchas)

## CI

GitHub Actions run on every PR: backend lint + tests, frontend lint + build, and Docker build validation for both images. A husky pre-commit hook runs lint-staged across all four apps.

## License

Proprietary — © Tiffo Technologies. All rights reserved.
