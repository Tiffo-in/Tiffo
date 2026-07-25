# Mobile Parity — Enterprise Implementation Plan

**Source:** `mobile_vs_website_audit_report.md` (July 25, 2026)
**Status:** Proposed. Codebase-verified against `backend/src`, `frontend/src`, `mobile/`, `mobile-partner/`.

---

## 0. Executive summary

The audit's feature-gap inventory is broadly correct, but implementation cost is **far lower than the report implies** — and two items should be struck entirely.

**The single most important finding: ~85% of the gap is UI-only work.** Every headline feature already has a working, correctly-authorized backend endpoint. No new domain modeling, no new data stores, no migrations.

| Gap | Backend today | Real work |
| --- | --- | --- |
| Dish-level menu editor | `PATCH /tiffins/:id/menu` ✅ | Mobile UI |
| Discount configurator | `PATCH /tiffins/:id/discount` ✅ | Mobile UI |
| Partner ad manager | `POST/GET/PUT /ads`, `/ads/wallet/*` ✅ | Mobile UI + payments dep |
| Partner analytics charts | `GET /partner/analytics` ✅ | Mobile UI + chart lib |
| Partner CSV export | `GET /export/orders` ✅ | Mobile UI + file/share dep |
| Customer fraud reporting | `POST /fraud` ✅ | Mobile UI |
| Customer blog reader | `GET /blog`, `/blog/:slug` ✅ | Mobile UI |

**Two audit items should be removed from the roadmap** (see §1). Correcting them removes roughly a sprint of misdirected work.

**The genuine enterprise risk is not features — it's the delivery platform.** Neither mobile app is in CI, `mobile-partner` has no test runner, and neither app has crash reporting. Shipping seven new screens onto that base is how you get silent production breakage. §2 fixes this first.

---

## 1. Corrections to the audit (do not build these)

### 1.1 "Customer Spend Analytics" is an admin feature, not a customer one

The report lists `CustomerAnalytics.jsx` as a customer-facing feature missing from the customer mobile app.

It is an **admin page**:
- `frontend/src/App.jsx:276` wraps it in `<RoleRoute role="admin">`
- it calls `GET /analytics/customers`, which is `protect, authorize('admin')` (`backend/src/routes/analytics.js:7`)

It is analytics *about* customers, for staff — not a customer's own spend dashboard. The report's own §4 already classifies admin tooling as intentionally web-only, so this is self-contradictory.

**Action:** strike from the customer roadmap. If a customer-facing spend dashboard is genuinely wanted, that is a **new product feature requiring a new endpoint** (`GET /analytics/me`), not a port — scope it separately.

### 1.2 "Security & Active Sessions Manager" does not exist on web

The report describes `Security.jsx` as offering password change, logged-in session review, and 2FA.

The file is a **110-line static marketing page** ("How We Keep You Safe") — no `useState`, no API calls, no session list, no 2FA. Confirmed absent on the backend: `backend/src/routes/auth.js` has no session-listing or 2FA endpoints; only `PUT /auth/password`.

**Action:** strike. Porting it would port a brochure. Session management and 2FA are a **new security epic** (backend + web + mobile) — worth doing, but it is net-new work, not parity.

### 1.3 Legal/corporate pages are content, not engineering

`Careers`, `Terms`, `About`, `PartnerGuidelines` need no per-page screens. One generic `ContentScreen` + remote content (or a WebView) covers all of them. Sized accordingly in §3.

---

## 2. Phase 0 — Enterprise foundations (blocking; ~1.5 sprints)

This is what makes the delta "enterprise" rather than feature-porting. **Do not start Phase 1 before 0.1–0.3 land.**

### 0.1 Put mobile in CI *(critical)*
`.github/workflows/ci.yml` builds only `backend-ci` and `frontend-ci`. Both mobile apps ship with zero automated verification.

- Add `mobile-ci` / `mobile-partner-ci` jobs: `npm ci` → `lint` → `tsc --noEmit` → `test`.
- Add a `typecheck` script to both apps; add a `test` script to `mobile-partner` (it has none).
- Gate on `tsc` from day one. Both apps currently carry pre-existing type errors (11 customer / 10 partner, mostly `shared-mobile` module resolution) — **fix those first**, or CI starts red and gets ignored.

### 0.2 Crash reporting & release health *(critical)*
Backend and frontend report to Sentry; neither mobile app does. Seven new screens with no crash visibility is unacceptable at enterprise bar.

- Add `sentry-expo` / `@sentry/react-native` to both apps, wired to existing Sentry infra.
- Tag events with app (`customer`/`partner`), release, and EAS build ID.

### 0.3 Shared mobile design system
Both apps now carry a `src/theme/` (colors, fonts, useTheme) — currently **duplicated by copy**, which will drift.

- Promote theme tokens into `shared-mobile/src/theme/` (already the established sharing mechanism via Metro `watchFolders` + TS `paths`).
- Build the shared primitives the new screens all need: `Button`, `Card`, `Input`, `Select`, `Sheet`, `EmptyState`, `Skeleton`, `FormField`, `Chart`.
- **Rationale:** seven screens across two apps built without shared primitives produce seven inconsistent UIs — exactly the divergence the audit flagged.

### 0.4 Platform capability dependencies
Each unlocks a Phase 1+ epic; land them together to avoid repeated native rebuilds.

| Capability | Dependency | Unblocks | Note |
| --- | --- | --- | --- |
| Charts | `react-native-svg` + chart lib | Partner analytics | Neither app has any chart lib |
| File export & share | `expo-file-system`, `expo-sharing` | CSV/PDF export | Neither app has either |
| Partner payments | `react-native-razorpay` | Ad wallet top-up | **Partner app has no payment dep at all** |
| Partner push | `expo-notifications` | Partner order alerts | Partner is in-app only today |

⚠️ `mobile-partner` uses `expo run:android/ios` (native builds), so native deps require a rebuild + EAS profile check. Batch these into one native release.

### 0.5 Contract safety
Mobile calls the API through hand-written types today. Before adding seven integrations:
- Generate/har­den shared TS types for the endpoints in scope (the backend already publishes Swagger at `/api/docs`).
- Add a thin service layer per feature in `shared-mobile` where customer/partner overlap.

---

## 3. Phase 1+ — Feature delivery roadmap

Sequenced by **revenue impact → partner retention → content**. Every item below is UI-only unless flagged.

### Phase 1 — Partner revenue tools (highest business value)

**Why first:** these directly gate partner earnings. A partner who cannot discount or fix a menu from their phone is a partner who churns.

#### 1.1 Dish-level menu editor — `mobile-partner`
- **Endpoint:** `PATCH /tiffins/:id/menu` (exists). Body: `{ menuItems: [...] }`, array-validated server-side.
- **Deps:** `expo-image-picker` (already present ✅) + `POST /upload` for dish photos.
- **Scope:** dish CRUD, categories (Main/Bread/Rice/Dal/Sweet), tags (spicy/veg), photo upload, batch save.
- **Acceptance:** partner adds/edits/reorders/deletes dishes with photos; offline-safe draft; optimistic save with rollback; parity with `MyTiffinsMenu.jsx`.

#### 1.2 Discount configurator — `mobile-partner`
- **Endpoint:** `PATCH /tiffins/:id/discount` (exists). Accepts `{ weekly, monthly, isActive, label, expiresAt }`, **server-validated 0–70**.
- **Scope:** replace hardcoded `priceDaily * 7` / `* 30` in `CreateTiffinScreen.tsx` with real discount controls + expiry date picker + sale label.
- **Acceptance:** client mirrors the 0–70 clamp (never relies on it alone); expired discounts render correctly; live price preview.

### Phase 2 — Partner growth & insight

#### 2.1 Business analytics charts — `mobile-partner`
- **Endpoint:** `GET /partner/analytics` (exists, partner-scoped).
- **Deps:** chart primitive from 0.3/0.4.
- **Scope:** visits vs. subscriptions, conversion %, 7-day trend.
- **Acceptance:** charts legible at 360dp, dark-theme correct, accessible fallback table, skeleton loading.

#### 2.2 Ad campaign manager — `mobile-partner`
- **Endpoints:** `POST /ads`, `GET /ads/mine`, `PUT /ads/:id`, `POST /ads/wallet/create-order`, `POST /ads/wallet/verify` (all exist).
- **Deps:** ⚠️ **`react-native-razorpay` — partner app has no payment capability today.** This is the only feature with a hard native blocker.
- **Scope:** campaign CRUD, budget controls, wallet top-up, ROI view.
- **Risk:** payment flows demand the highest test bar — sandbox verification, failure/retry paths, and idempotency on `wallet/verify`. Consider shipping campaign management first (read/CRUD) and wallet top-up as a fast-follow.

#### 2.3 Report export — `mobile-partner`
- **Endpoint:** `GET /export/orders` (exists; partner-accessible — the other `/export/*` routes are `adminAuth`-gated, so **only orders is in scope**).
- **Deps:** `expo-file-system` + `expo-sharing`.
- **Acceptance:** CSV downloads and opens in the OS share sheet on both platforms; correct handling of large files and permission denial.

### Phase 3 — Customer trust & content

#### 3.1 Fraud reporting — `mobile`
- **Endpoint:** `POST /fraud` (exists; publicly postable — GET/PUT are admin).
- **Scope:** report form (hygiene, adulteration, non-delivery, fake listing), evidence photo upload, confirmation state.
- **Note:** abuse-prone. Confirm rate limiting on the public POST before launch.

#### 3.2 Blog & content reader — `mobile`
- **Endpoints:** `GET /blog`, `/blog/categories`, `/blog/:slug`, `POST /blog/:id/view` (all public ✅).
- **Scope:** list, category filter, article reader, view tracking, deep-link support.

#### 3.3 Legal/corporate content — `mobile`
- One generic `ContentScreen` for Terms/About/Careers/Guidelines (see §1.3). Smallest item on the list.

---

## 4. Backend work actually required

Deliberately short — this is the plan's main cost saving.

1. **None** for Phases 1–3 as scoped. All endpoints exist and are correctly authorized.
2. **If** a customer spend dashboard is wanted (§1.1): new `GET /analytics/me`, customer-scoped. New feature, separate scoping.
3. **If** session management/2FA is wanted (§1.2): new security epic — session store, list/revoke endpoints, 2FA enrollment. Backend + web + mobile.
4. **Verify before launch:** rate limiting on public `POST /fraud`; idempotency on `POST /ads/wallet/verify`.

---

## 5. Cross-cutting enterprise requirements

Applies to every screen above; these are acceptance criteria, not optional polish.

- **Design consistency** — all new UI consumes shared theme tokens; no hardcoded hex. (The audit's root cause was exactly this drift.)
- **Accessibility** — labels on all interactive elements, ≥44pt touch targets, WCAG AA contrast, Dynamic Type tolerance.
- **State handling** — every screen implements loading / empty / error / offline. Non-negotiable for field use on poor connections.
- **Security** — no PII in logs or URL params; tokens stay in the existing AsyncStorage-per-app scheme; evidence/document uploads validated for type and size.
- **Performance** — virtualized lists, image caching/resizing before upload, no unbounded re-renders on chart screens.
- **Testing** — unit tests for pricing/discount math and service layers; the discount clamp and menu batch-save are the highest-value targets.
- **Release** — EAS profiles per app, staged rollout, and a **kill switch / feature flag for the payments path** in 2.2.
- **Analytics** — instrument new screens for adoption measurement; otherwise parity is unverifiable post-launch.

---

## 6. Sequencing & milestones

```
Phase 0  Foundations (CI, Sentry, design system, native deps)   [BLOCKING]
   │
   ├─ Phase 1  Menu editor + Discounts        → partner revenue unblocked
   │
   ├─ Phase 2  Analytics → Export → Ads       → ads last (native payments risk)
   │
   └─ Phase 3  Fraud → Blog → Legal content   → customer trust & content
```

**Rationale for the ordering:**
- Phase 0 is genuinely blocking — CI and crash reporting must exist *before* seven new screens land, not after.
- Phase 1 is pure UI over existing, validated endpoints: highest value, lowest risk, fastest proof of the new design system.
- Ads (2.2) sit last in Phase 2 because they are the only item with a hard native dependency *and* real money.
- Phase 3 is lowest-risk and can run in parallel by a second developer once the design system is stable.

---

## 7. Decisions needed before kickoff

1. **Customer spend analytics** — build the new `GET /analytics/me` feature, or drop it? (Report miscategorized it; §1.1.)
2. **Sessions/2FA** — fund as a net-new security epic, or defer? (Does not exist anywhere today; §1.2.)
3. **Partner payments** — accept `react-native-razorpay` in `mobile-partner`, or defer wallet top-up and ship campaign management only? (§2.2.)
4. **Partner app identity** — remains a dark "operations console"? Currently dark slate + brand orange accent. Affects all Phase 1–2 UI.
5. **Admin on mobile** — audit says web-only by design. Confirm, so it stops resurfacing as a gap.

---

## Appendix — Verification basis

Claims here were checked against the codebase, not inferred from the report:

| Claim | Evidence |
| --- | --- |
| Menu/discount endpoints exist | `backend/src/routes/tiffins.js:28,31` |
| Discount server-clamped 0–70 | `tiffinController.js:285-288` |
| Partner analytics is partner-scoped | `backend/src/routes/partner.js:45` |
| CustomerAnalytics is admin-gated | `frontend/src/App.jsx:276`; `routes/analytics.js:7` |
| Security.jsx is static | `frontend/src/pages/Security.jsx` — 110 lines, no state/API |
| Only `/export/orders` is partner-accessible | `backend/src/routes/export.js:17-23` |
| Blog reads are public | `backend/src/routes/blog.js:17-20` |
| No chart lib in either app | `mobile/package.json`, `mobile-partner/package.json` |
| Partner has no payment dep | `mobile-partner/package.json` |
| Mobile absent from CI | `.github/workflows/ci.yml` — only `backend-ci`, `frontend-ci` |
| No Sentry in mobile | neither mobile `package.json` references Sentry |
