# Subscription Experience — Feature Plan

Status: **all five phases delivered** (branch `feat/subscription-experience`) · Last updated: July 2026

Delivered: Phase 1 (per-day delivery status timeline + today's deliveries API +
notifications), Phase 2 (skip-a-day with transactional make-up day, cutoff +
monthly cap), Phase 3 (today's tiffin + menu), Phase 4 (idempotent renewal
reminders via node-cron + Cloud-Scheduler endpoint, one-tap renew), Phase 5
(per-meal feedback + issue reports). Backend 134 tests passing; every phase
verified with a green frontend build and a live boot against Atlas. Mobile UI
for these surfaces is the remaining follow-up (the APIs already serve it).

Five features that fit Tiffo's **subscription tiffin** model (reliability & control), not on-demand delivery (live tracking). Ordered by dependency and retention value. Each phase is independently shippable.

## Product framing

Customers prepay for daily/weekly/monthly meal plans and receive a tiffin in a **known daily time slot they chose**. So the job-to-be-done is *"will my meal show up, can I control it, and did it arrive?"* — not *"where is my driver right now."* Every feature below serves reliability, predictability, or control.

## What already exists (so we build, not rebuild)

- `Delivery` model already has `status` (`scheduled → preparing → out_for_delivery → delivered → cancelled`), per-status timestamps, and a `feedback` subdoc (`rating`, `comment`, `images`).
- `deliveryService.generateDeliveriesForSubscription()` creates one `Delivery` per available day between `startDate` and `endDate`.
- Partner app already transitions delivery status (`PUT /deliveries/:id/status`).
- Realtime notifications: `emitNotification(userId, notification)` (socket) + `emailService` + mobile push (`notificationService`).

## What's missing (the shared foundation)

- **No customer-facing deliveries endpoint** — only partners can list deliveries.
- **No scheduler** — the codebase uses lazy "reset-on-read" (see `adController.resetDailyBudgetsIfNeeded`). Renewals/reminders need either a real scheduler or a triggered/lazy approach (decision below).
- **No `skipped` delivery state**, no per-day skip flow, no renewal flow.

---

## Phase 1 — Per-day delivery status (foundation + quick win)

**Goal:** the customer sees today's meal state — `Preparing → Out for delivery → Delivered` — as a simple chip/timeline. No map. One notification when it goes out for delivery.

**Backend**
- New: `GET /api/subscriptions/:id/deliveries` (owner-scoped) — paginated list of that subscription's deliveries with status + timestamps.
- New: `GET /api/deliveries/today` — the customer's deliveries scheduled for today across active subscriptions.
- Hook into the existing partner `updateDeliveryStatus`: on `out_for_delivery` and `delivered`, call `emitNotification(delivery.user, …)` + mobile push. (Reuse the socket→AsyncStorage history flow already in the mobile `RootNavigator`.)

**Frontend (web + mobile)**
- `Orders.jsx` / mobile Subscriptions: a per-day timeline with a status chip and the four states; "Delivered at 1:12 PM" from `deliveredAt`.
- Empty/loading/error states.

**Edge cases:** timezone — deliveries are date-only; compute "today" in IST consistently server-side.

**Effort:** S–M (mostly surfacing existing data). **Risk:** low. **Unblocks:** Phases 3 & 5 (both read the deliveries list).

---

## Phase 2 — Skip a single day (highest retention value)

**Goal:** "I'm traveling Thursday — skip that tiffin." Skipping **extends the plan by one make-up day** (no money lost, no refund accounting), which is simpler and more generous than credits.

**Backend**
- Add `'skipped'` to the `Delivery.status` enum.
- New: `PATCH /api/deliveries/:id/skip` (owner-scoped):
  - Guardrails: only a **future** delivery, and before a **cutoff** (e.g. 8 PM the day before, or before the partner sets `preparing` — whichever first). Reject otherwise.
  - Set delivery `status='skipped'`; append one make-up delivery on the next available day after `endDate`; bump `subscription.endDate`.
  - Enforce a **monthly skip cap** (e.g. max 4/plan) to prevent abuse.
- New: `PATCH /api/deliveries/:id/unskip` (before the same cutoff) to reverse.
- Extract the "next available day" logic from `deliveryService` so skip and generation share it.

**Frontend:** a "Skip this day" action on each upcoming delivery with the cutoff/cap surfaced ("2 of 4 skips left this month").

**Edge cases:** skip while subscription is paused; skip the last day; concurrent skip + partner status change (guard with the cutoff + a status check in one atomic update).

**Effort:** M. **Risk:** medium (touches delivery + subscription + regeneration; needs tests). **Business decision needed:** make-up-day vs credit vs refund — this plan assumes **make-up day**.

---

## Phase 3 — Meal calendar + "what's for lunch today"

**Goal:** predictability — subscribers see the upcoming week and today's dish.

**Backend**
- Reuse Phase 1's deliveries list; join `tiffin.menuItems` for the dish. If partners set a **daily** menu (`menuOfTheDay` exists on the ad/campaign model — confirm the source of truth), surface that; else fall back to the tiffin's standard menu.

**Frontend:** a month/week calendar in `Dashboard.jsx` / mobile, each day showing meal + status (from Phase 1); "Today" highlighted with the menu.

**Effort:** M (frontend-heavy). **Risk:** low. **Depends on:** Phase 1.

---

## Phase 4 — Renewal reminders + one-tap renew (protects revenue)

**Goal:** "Your weekly plan ends tomorrow — renew" before it lapses.

**Scheduler decision:** two options, pick one —
- **(a) Real scheduler** (`node-cron` in-process, or an external Cloud Scheduler → authenticated endpoint). Cleanest for time-based reminders. Recommended given this is revenue-critical and shouldn't depend on traffic.
- **(b) Lazy/triggered** (compute "ending soon" on dashboard load / on any request), matching the existing `resetDailyBudgetsIfNeeded` pattern. No new infra, but reminders only fire when the user is already active — weak for *re-engagement*. Not recommended for renewals.

**Backend**
- Reminder job: find subscriptions with `status='active'` and `endDate` within N days; send email + push (throttled/idempotent — one reminder per subscription per window; store `renewalReminderSentAt`).
- New: `POST /api/subscriptions/:id/renew` — create a new subscription continuing from the old `endDate`, same tiffin/plan/address, reusing the payment flow (online → Razorpay order; COD → immediate). Idempotent per source subscription.

**Frontend:** "Renew" CTA on ending subscriptions + a deep link from the reminder email/push.

**Effort:** M–L (scheduler + payment reuse + templates). **Risk:** medium (money + idempotency). **Depends on:** payment flow (exists).

---

## Phase 5 — Per-meal feedback / missed-delivery report (trust)

**Goal:** a quick per-day "rate / report a problem" — trust is everything for prepaid meals.

**Backend**
- New: `POST /api/deliveries/:id/feedback` (owner-scoped) — writes the **existing** `Delivery.feedback` subdoc (rating/comment/images via the existing upload pipeline). Only for `delivered` (or `out_for_delivery` past slot) deliveries.
- New: `POST /api/deliveries/:id/report` — flags a missed/bad delivery for admin review; on approval, resolve via a make-up day (reuse Phase 2 logic) or partner-side note. Route into the existing support/admin surface.
- Feed delivery ratings into the partner's aggregate rating (server-managed, consistent with the review system).

**Frontend:** a post-delivery prompt ("How was today's tiffin?") + a "Report an issue" path.

**Effort:** M. **Risk:** low–medium. **Depends on:** Phase 1 (delivery list), Phase 2 (make-up-day logic for resolutions).

---

## Cross-cutting concerns

- **Timezone:** all "today"/cutoff math in **IST**, server-side — never trust client date.
- **Idempotency:** skip/unskip, renew, and reminders must be idempotent (status guards + `*SentAt` markers).
- **Notifications:** one reusable helper that fans out to socket + email + mobile push, so every phase emits consistently.
- **Tests:** each phase ships jest coverage for the new controllers/services (the repo's bar — controllers currently at 113 passing). Skip-a-day and renew especially need transaction + edge-case tests.
- **Migrations:** adding `'skipped'` to the enum and `renewalReminderSentAt` are additive/backfill-safe (fits the existing idempotent boot-migration pattern in `config/database.js`).
- **Rollout:** Phase 1 first (read-only, unlocks the rest), then 2 (retention), then 3/5 (experience/trust), then 4 (revenue, needs the scheduler decision).

## Suggested sequence

**1 → 2 → 5 → 3 → 4.** Phase 1 is the low-risk foundation everything reads from; Phase 2 is the biggest retention win; 5 reuses 2's make-up logic; 3 is polish; 4 is highest-effort (scheduler) and best done once the delivery surface is mature.
