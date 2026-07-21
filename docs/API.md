# Tiffo API — Surface Overview

Interactive, always-current docs: **Swagger UI at `/api/docs`** (https://api.tiffo.in/api/docs). This file is the 60-second orientation, not the reference.

Base URL: `https://api.tiffo.in/api` (local dev: `http://localhost:5001/api`).

## Conventions

- **Auth**: JWT in an httpOnly `token` cookie (web) or `Authorization: Bearer <jwt>` (mobile). Obtain via `POST /auth/login`, `POST /auth/register`, or `POST /auth/google`.
- **CSRF**: cookie-authenticated mutating requests must echo the `csrf_token` cookie in an `X-CSRF-Token` header. Bearer requests are exempt.
- **Responses**: `{ success: boolean, data | user | message, pagination? }`.
- **Rate limits**: strict on `/auth/*` (5/15 min in production), general limit on everything else (100/15 min per IP).

## Route groups

| Prefix | Purpose | Access |
|---|---|---|
| `/auth` | Register (user/partner), login, Google Sign-In, email verify, password reset, profile | Public + own-session |
| `/tiffins` | Browse/search tiffin listings; partner CRUD on own listings | Public read · partner write |
| `/subscriptions` | Create/pause/resume subscriptions, order history, stats | Authenticated, own data |
| `/payments` | Razorpay order creation + signature verification | Authenticated |
| `/webhooks/razorpay` | Razorpay events (payment, transfer, refund) — HMAC over raw body | Razorpay only |
| `/deliveries` | Delivery detail, partner delivery ops, admin overview | Owner / partner / admin |
| `/partner` | Partner profile, dashboard stats, earnings, customers | Partner |
| `/reviews` | Create (verified subscribers only) and read reviews | Authenticated write · public read |
| `/messages` | Customer ↔ partner chat (paired with Socket.io) | Conversation members |
| `/ads` | Partner ad campaigns, wallet top-up (Razorpay), public listings/click tracking | Partner · public tracking |
| `/admin` | User/partner/payment/delivery management, finance, dashboards | Admin (some super-admin) |
| `/export` | CSV exports (customers, payments, subscriptions, orders) | Admin (orders: partner-scoped) |
| `/blog`, `/banners`, `/support`, `/waitlist`, `/fraud`, `/analytics`, `/upload`, `/sitemap.xml` | Content, support tickets, fraud reports, analytics, image upload | Mixed — see Swagger |

## Realtime (Socket.io)

Same origin as the API. Handshake accepts a JWT (`auth.token`) or falls back to a guest connection; server tracks connected users and emits notification/delivery events to user-scoped rooms.
