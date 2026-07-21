# Tiffo — Full Codebase Review (July 2026)

Scope: backend security + code quality, frontend code quality, live-site UI/UX. Findings verified against the actual code (file:line) and the live site (tiffo.in). Fixes applied in this pass are marked **[FIXED]**; everything else is the recommended backlog.

## Verdict in one paragraph

The platform is in much better shape than a typical indie codebase: env validation fails fast, CSRF is a proper stateless double-submit HMAC, rate limiting is distributed with a sane fallback, the Razorpay webhook verifies HMAC over raw bytes, passwords are bcrypt(12), and past incidents (ReDoS, IDOR, XSS, N+1) were fixed *and* recorded in `.jules/`. The remaining problems cluster in two places: **mass assignment** (spreading `req.body` into Mongoose writes) and **one unscoped export endpoint** that leaks customer PII, plus a missing audience check on Google Sign-In.

---

## Security findings

### Critical

**S1. `GET /api/export/orders` leaks every customer's PII to any logged-in user** — `backend/src/controllers/exportController.js:96`, route `backend/src/routes/export.js:23`.
The route is `protect`-only (all other export routes are admin-gated) and the Mongo query is built solely from query params — no user scoping. Any authenticated `user` account could download a CSV of **all** deliveries with customer name, email, and phone, optionally filtered by any `partnerId`. **[FIXED]** — partners now get only their own orders (server-derived partner id, client `partnerId` ignored); admins retain full export; plain users get 403.

**S2. Ad wallet mass assignment lets partners mint ad credit** — `backend/src/controllers/adController.js` (`createCampaign`, `updateCampaign`).
Both spread `req.body` into `AdCampaign.create`/`findOneAndUpdate`. The schema includes `walletBalance`, `freeImpressions`, `spentToday`, `totalSpent`, `impressionsCount`, `clicksCount` — so `PUT /api/ads/:id {"walletBalance": 999999}` grants free advertising, silently bypassing the Razorpay wallet top-up flow. **[FIXED]** — writes now use an explicit allowlist (`slot`, `maxBidPerClick`, `dailyBudget`, `tiffin`, `isActive`, trial/menu fields); balances and counters can only change through payment verification and click/impression logic.

### High

**S3. Tiffin mass assignment lets partners set their own ratings** — `backend/src/controllers/tiffinController.js` (`createTiffin`, `updateTiffin`).
`...req.body` into `Tiffin.create` and raw `req.body` into `findOneAndUpdate` allow writing `rating` (average + count), `slug`, and — on update — even reassigning `partner`. Fake 4.9★ listings undermine the platform's core trust signal. **[FIXED]** — explicit field allowlist for both create and update; `rating`, `slug`, `partner` are server-managed.

**S4. Google Sign-In does not verify the token audience** — `backend/src/controllers/authController.js` (`googleLogin`).
The ID token is validated against Google's `tokeninfo` endpoint but the `aud` claim is never compared to our `GOOGLE_CLIENT_ID` (which already exists in `.env.example`). Classic token-substitution: any malicious app whose users sign in with Google could replay their tokens against Tiffo and mint sessions for those users' emails. `email_verified` was also unchecked. **[FIXED]** — `aud` must match `GOOGLE_CLIENT_ID` (fails closed in production when the var is set) and `email_verified` must be true.

### Medium

**S5. Fraud report mass assignment** — `backend/src/controllers/fraudController.js:10`. Public endpoint spreads `req.body` into `FraudReport.create`, so a reporter can pre-set `status` (e.g. `dismissed`) or spoof `reporterUserId` when anonymous. **[FIXED]** — explicit field pick; `status` and `reporterUserId` are server-set.

**S6. Webhook signature compared with `!==`** — `backend/src/controllers/webhookController.js:31`. Not timing-safe (the payment-verify path already uses a safe compare via Razorpay's SDK utils; the webhook should match). **[FIXED]** — `crypto.timingSafeEqual` with length guard.

**S7. Email enumeration via `resend-verification`** — `authController.js` returns 404 "User not found", while `forgot-password` correctly returns a uniform 200. An attacker can probe which emails have accounts. **[FIXED]** — uniform response regardless of account existence.

**S8. Raw `error.message` returned to clients** in many controllers (`tiffinController`, `adController`, `messageController`, etc.). Mongoose/internal messages can leak schema details. *Backlog*: route errors through the central `errorHandler` (`next(error)`) which already does generic-in-prod messaging; done opportunistically in files touched by this review.

### Noted, accepted for now

- `logClick` / ad impression endpoints are public and could be scripted to drain a competitor's ad budget (click fraud). The global rate limiter blunts this; a per-campaign daily anomaly check is the real fix. (Business-logic backlog.)
- `express.json({ limit: '10mb' })` is generous; fine while base64 images flow through JSON, revisit if that changes.
- Double-submit CSRF trusts any `*.tiffo.in` subdomain cookie writer — acceptable given all subdomains are first-party.
- 404 handler is registered after the error handler in `app.js` — works (error handler is 4-arity) but unconventional.

---

## Code quality findings

**Q1. Dead code**: `backend/src/test-app.js` is a scratch file (12 lint warnings, unused imports, `console.log`) shipped in the Docker image. **[FIXED]** — deleted.

**Q2. Lint**: backend `npm run lint` → 0 errors / 94 warnings, dominated by `no-console` in `seeds/` and unused vars in tests. Backlog: allow `console` in `seeds/` via eslint override instead of accumulating warnings.

**Q3. Unused dependency on web**: `@tanstack/react-query` + devtools are in `frontend/package.json` but never imported (Redux Toolkit is the real state layer). Backlog: remove from `frontend/package.json` (they are genuinely used in the mobile apps — leave those).

**Q4. Oversized page components**: `TiffinDetail.jsx` (916 lines), `MyTiffins.jsx` (671), `Register.jsx` (627), `Home.jsx` (623) all exceed the ~300-line bar. Backlog: extract section components (hero, feature grid, card lists) — mechanical, low-risk.

**Q5. Stray docs in repo root**: `CUSTOMER_SELECTION_FEATURE.md`, `SUBSCRIPTION_DASHBOARD.md`. **[FIXED]** — moved to `docs/`. Root `README.md` was missing entirely — **[FIXED]** — added, plus `docs/ARCHITECTURE.md` and `docs/API.md`.

**Q6. `axios.tgz` + `platform.log` in repo root** — build artifacts that shouldn't live in the tree. **[FIXED]** — removed (`platform.log` was already gitignored; `axios.tgz` untracked).

---

## UI/UX review (live site, desktop + 375px mobile)

**What's working well**: cohesive premium-dark direction with a confident type scale; mobile layout is genuinely clean (hamburger nav, readable hierarchy, full-width CTAs); trust signals (VERIFIED badges, veg/non-veg chips, ratings) are prominent; the location prompt explains itself ("Your location is not stored" — excellent microcopy); dark/light toggle present.

**UX1 (High). Scroll-reveal can leave content invisible.** Most Home sections start at `opacity: 0` and rely on Framer Motion `whileInView` to appear. In an automated Chrome session, "Why Choose Tiffo?" stayed at `opacity: 0` even while scrolled into the viewport — the content exists in the DOM but never paints. Risk surface: prerenderers/SEO snapshots, low-power devices, any IntersectionObserver hiccup. Recommendation: content should be visible by default and *enhanced* by animation (animate transform only, or add a CSS `animation-fill-mode` fallback), never gated by it.

**UX2 (Medium). Every tiffin card shows the same 🍱-on-orange-gradient placeholder.** For a food product, photography *is* the merchandising. Recommendation: make real photos a partner-onboarding requirement (upload flow already exists via Cloudinary) and design one deliberate placeholder for the genuinely photo-less case.

**UX3 (Low). Emoji as UI icons** (📍 🍱 👨‍🍳 ⏰ ✅ 🚚) render inconsistently across platforms and mix with real icon glyphs elsewhere. Recommendation: standardize on the icon set for functional UI; keep emoji only where personality is intended.

**UX4 (Low). Heavy ambient animation on Home** (floating parallax food emojis, large blurred gradients). Scrolling stressed the main thread noticeably in testing. `useReducedMotion` is already wired — extend it to disable ambient layers, and consider `content-visibility: auto` for below-fold sections.

---

## Verified check results (this review)

- Backend `npm run lint`: **0 errors**, 94 warnings (see Q2).
- Backend `npm audit`: **0 vulnerabilities** (after refreshing `package-lock.json`).
- Backend `npm test` (jest): run after the security fixes — result recorded in the commit that accompanied this review.
- Frontend `npm run lint` + `npm run build`: attempted locally but the dev machine's iCloud-synced Desktop kept evicting `node_modules` (reads timed out). **UNVERIFIED locally** — CI runs both on every PR and remains the gate.

## Prioritized backlog

Update (July 20, 2026): a follow-up pass fixed most of this list — controller
errors now route through the central handler (43 sites), `react-query` and
dead frontend modules/tests were removed, seeds get a lint override, Home was
split into section components with transform-only (never opacity-gated)
reveals, ad clicks are deduped per viewer with a daily billing cap, webhook
failures email ops (throttled), Cypress has hermetic stubbed specs plus npm
scripts, the mobile registration flow was fixed with jest-expo regression
tests, and the mobile apps auto-target a local backend in dev.

Still open:

1. Real food photography program + single designed placeholder (UX2) — needs
   actual photos from partners; the upload pipeline is ready.
2. Split the remaining oversized pages: `TiffinDetail.jsx` (916), `MyTiffins.jsx`
   (671), `Register.jsx` (627) — Home is done and establishes the pattern
   (`components/home/`).
3. Run the Cypress suite in CI (needs a `start-server-and-test` style job; the
   specs themselves are hermetic and backend-free).
4. Partner-facing anomaly reporting for ad clicks (server-side dedupe is in;
   a dashboard signal would close the loop).
5. Move the repo off the iCloud-synced Desktop — eviction corrupted
   node_modules and committed a duplicate source file; it also makes builds
   ~10x slower.
