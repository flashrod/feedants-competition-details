# Feedants — Competition Details (full-stack)

Functional Competition Details screen: **React Native (Expo)** + **Node.js + Express** + **MongoDB (Mongoose)**.
Nothing on the screen is hardcoded — every number, date, badge and button state is served by the API.

> Note: no design image file was attached to the task, so the UI follows the standard Feedants-style
> fantasy competition page (header stats, spots progress, countdown timeline, prize breakdown, rules,
> participants, sticky Join/Leave bar) and implements every dynamic behaviour listed in the brief.

## Repo layout

```
feedants-competition-details/
  backend/          Express + Mongoose API (TypeScript)
    src/
      models/       User, Competition, Participation
      routes/       competitions.ts (list/detail/participants/join/leave)
      utils/        status.ts — canonical lifecycle derivation
      middleware/   errors, app.ts, server.ts, config/
    scripts/        seed.ts (one competition per lifecycle state), smoke.ts
    tests/          competitions.test.ts (incl. 50-user race for 10 spots)
  mobile/           Expo React Native app (TypeScript)
    screens/        CompetitionDetailsScreen
    components/     Header, SpotsProgress, DateTimeline, Prize/About, Participants, StickyActionBar, StatusBanner
    hooks/          useCompetitionDetails (react-query + optimistic join), useCountdown
    api/            typed client
  docker-compose.yml  mongo + api in one command
```

## Run it

### 1. Backend

```bash
cd backend
cp .env.example .env        # MONGODB_URI=mongodb://localhost:27017/feedants
npm install
npm run seed                # prints the demo user id + 4 competitions
npm run dev                 # http://localhost:4000
```

Or with Docker: `docker compose up --build` (seeds on first boot if `SEED_ON_BOOT=true`).

### 2. Mobile app

```bash
cd mobile
npm install
# point at your API (LAN IP when using a physical device):
EXPO_PUBLIC_API_URL=http://localhost:4000 \
EXPO_PUBLIC_DEMO_USER_ID=<id printed by seed> \
npx expo start
```

Open with Expo Go, or press `i` / `a` for simulator. The header lets you switch between the four
seeded competitions (open / almost-full / live / completed) and set the demo user id that drives
Join/Leave. Pull-to-refresh re-fetches; open spots + countdowns poll every 15s while registration is open.

### 3. Screen recording

Suggested 60-second script (what the evaluators should capture):
1. Open `weekend-mega-clash` as demo user → registered state, countdown ticking.
2. Leave → spots +1, CTA flips to Join; Join again with team name → spots −1.
3. Open `last-minute-sprint` → 1 spot left; join from two devices/users → second gets 409 "full".
4. Open `monday-night-live` → Live banner, Join disabled; `season-champions-2025` → Completed state.

## API

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/health` | liveness |
| GET | `/api/users` | demo helper (remove in prod) |
| GET | `/api/competitions` | list (max 50) |
| GET | `/api/competitions/:idOrSlug?userId=` | detail + `viewer` context + `serverTime` |
| GET | `/api/competitions/:id/participants?limit&cursor` | cursor-paginated registrations |
| POST | `/api/competitions/:id/join` | `{userId, teamName?, idempotencyKey?}` — atomic spot claim |
| POST | `/api/competitions/:id/leave` | `{userId}` — withdraw, frees one spot |

All errors: `{ error: { message, status } }`. Join/leave rate-limited (60/min/IP on the router).

## Data model

- **Competition** — canonical fields (dates, fees, prizes) + denormalized `participantCount`.
  Unique `slug`, indexes on `startsAt`/`isFeatured`. Optimistic concurrency on.
- **Participation** — one row per `(competitionId, userId)` (unique compound index);
  leave sets `status: withdrawn` instead of deleting, so rejoin reactivates and the counter stays exact.
- **User** — name + mock `walletBalance` (entry-fee check; production → ledger service).

**Lifecycle is derived, never stored:** `getCompetitionStatus()` computes
`upcoming → registration_open → full / registration_closed → live → completed` (+ `cancelled`)
from `registrationOpensAt / registrationDeadline / startsAt / endsAt / participantCount / isCancelled`
on every read, so the API can never serve a stale status. The same function drives `viewer.canJoin/canLeave/joinDisabledReason`, which the app maps 1:1 to CTA states.

## Concurrency

Join = conditional atomic claim + row write + compensation:
1. Fresh read → already-joined / balance / lifecycle checks.
2. `findOneAndUpdate({_id, participantCount: {$lt: max}, registration window, startsAt > now}, {$inc: +1})` — the single guard that makes oversell impossible, even with thousands of concurrent requests.
3. Upsert Participation; on any failure the claimed spot is refunded (`$inc: −1`).
4. `Idempotency-Key` body field makes client retries safe.

Verified by `tests/competitions.test.ts`: **50 concurrent joins for 10 spots → exactly 10 × 201, 40 × 409**, counter == row count; double-join never double-counts. `scripts/smoke.ts` exercises all four lifecycle states end-to-end.

## Assumptions, decisions & trade-offs

- **No design file was provided**, so visual fidelity is to the generic Feedants fantasy-competition pattern rather than a pixel match; all effort went into dynamic behaviour.
- **Auth is `x-user-id` header** for the assignment; swap for JWT middleware + row-level checks in prod (marked in code).
- **Wallet is a mock field** decremented with `$inc`; a real-money app needs a ledger transaction (outbox pattern) instead.
- **No MongoDB transactions**: the conditional-increment + compensation works on standalone Mongo and under sharding; on a replica set you could additionally wrap claim+insert in a transaction for stricter atomicity.
- **Polling (15s while open) instead of WebSockets**: simpler and sufficient for countdowns/spots; live scoring at scale would move to sockets/push.
- **Rate limit is per-IP in-memory**: fine for one instance; use Redis sliding-window behind a load balancer in prod.
- **Prize payout / leaderboard / team builder** are out of scope: detail shows prize breakdown + participants preview; results tab would be the next screen.

## What I'd do next for production

JWT auth + roles, Redis rate limiting + caching of hot competition docs, WebSocket/push for live + last-spots updates, full leaderboard/results endpoints, payment ledger, admin cancel/publish flow, E2E tests (Detox/Maestro), Sentry + OpenTelemetry, and CDN-hosted cover images.
