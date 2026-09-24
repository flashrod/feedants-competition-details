# Feedants — Competition Details (full-stack)

Functional Competition Details screen: **React Native (Expo)** + **Node.js + Express** + **MongoDB (Mongoose)**.
Nothing on the screen is hardcoded — every number, date, badge and button state is served by the API.

The mobile app implements the **Objective pixel spec** (`feedants-classical-dance`):
all 16 blocks top-to-bottom (status/top bar, summary card, judge card, countdown banner,
dates grid, winners scroller, info tabs, rewards, disclaimer, trust row, refer card,
testimonials, ad slot, sticky CTA, tab bar) on the 852px-canvas scale system (`s = deviceWidth/852`),
Inter + Noto Sans Devanagari, Lucide icons, and a working ENG/हिंदी toggle.

## Repo layout

```
feedants-competition-details/
  backend/          Express + Mongoose API (TypeScript)
    src/
      models/       User, Competition, Participation
      routes/       competitions.ts (list/detail/participants/join/leave)
      utils/        status.ts — canonical lifecycle derivation
      middleware/   errors, app.ts, server.ts, config/
    scripts/        seed.ts (5 competitions incl. pixel-spec dance), smoke.ts, stress-live.ts
    tests/          competitions.test.ts (50-user race, detail shape)
  mobile/           Expo React Native app (TypeScript)
    screens/        ObjectiveScreen (pixel-spec assembly)
    components/obj  one file per spec block (TopBar → TabBar)
    components/     Tx (Inter/Devanagari text), theme (spec tokens)
    utils/scale.ts  s = deviceWidth/852; px(n) = n*s
    hooks/          useCompetitionDetails (react-query + optimistic join), useCountdown
    api/            typed client
    i18n.ts         ENG/हिंदी dictionary (client-side)
  docker-compose.yml  mongo + api in one command
```

## Run it

### 1. Backend

```bash
cd backend
cp .env.example .env        # MONGODB_URI=mongodb://localhost:27017/feedants
npm install
npm run seed                # prints the demo user id + 5 competitions
npm run dev                 # http://localhost:4000
```

Or with Docker: `docker compose up --build` (with `SEED_ON_BOOT=true` the API
auto-seeds an empty database on boot).

### 2. Mobile app

```bash
cd mobile
npm install
# point at your API (LAN IP when using a physical device):
EXPO_PUBLIC_API_URL=http://localhost:4000 \
EXPO_PUBLIC_DEMO_USER_ID=<id printed by seed> \
npx expo start
```

Open with Expo Go, or press `i` / `a` for simulator. The screen renders
`feedants-classical-dance` for the demo user id: registered users see the
"Registered" badge + "Upload Submission" CTA (plus a **Leave** link that frees
their spot); unregistered users get a "Register Now · ₹ 99" CTA wired to the
atomic join endpoint. Pull-to-refresh re-fetches; countdown ticks every second
and polls while registration is open.

**Browser preview** (what the demo recording uses): `npx expo start --web`.
`App.tsx` resolves the route from query params, so any competition and any user
can be deep-linked without re-seeding other simulated users:

\`\`\`bash
npx expo start --web
open "http://localhost:8081/?slug=last-minute-sprint&userId=<id printed by seed>"
\`\`\`

The `userId` is optional (falls back to `EXPO_PUBLIC_DEMO_USER_ID`); omit `slug`
to get the default `feedants-classical-dance`.

### 3. Screen recording

A 26s self-contained walkthrough was captured from the browser build and
assembled in **`.recording/feedants-demo.mp4`** (gitignored; regenerate with the
scripted ffmpeg concat in `.recording/`): countdown ticking, full-panel scroll,
ENG/हिंदी toggle, join → Leave → re-join on the dance screen, then each
lifecycle state on `last-minute-sprint` / `monday-night-live` /
`season-champions-2025`.

If you re-record from scratch, run `npm run seed` in `backend/` first — the seed
prints the (fresh) demo user id, and a seeded DB that has been sitting around for
over a day stops demonstrating `live`/open states (they are time-derived, on
purpose). Suggested 60-second script:

1. Open `weekend-mega-clash` as demo user → registered state, countdown ticking.
2. Leave → spots +1, CTA flips to Join; Join again with team name → spots −1.
3. Open `last-minute-sprint` → 1 spot left; join from two devices/users → second gets 409 "full".
4. Open `monday-night-live` → Live banner, Join disabled; `season-champions-2025` → Completed state.

## Objective-spec mapping

- Seed competition `feedants-classical-dance` carries the exact spec payload:
  title/tags/certificate flag, ₹1,500 pool = 550+300+240+200+130+80 rewards with
  gold/silver/bronze/star icons, 20 capacity / 1 booked, judge Manju Dubey,
  4 previous winners, about/judging/rules tabs, referral link + ₹10/signup.
- The registration deadline is seeded `now + 30h28m32s` so the banner reads
  `01d : 06h : 28m : 32s` and ticks live; display dates keep the spec quirks
  (`1 Sept`, `04:00 AM`) via client formatters.
- API detail adds `capacity/booked`, `judge`, `milestones{registerBefore,
  submissionStarts, submissionEnds, result}`, `previousWinners`, `rewards[]`,
  `aboutTabs`, `referral`, `certificateForWinners` (all optional → sections hide
  when absent, so older competitions keep working).
- Progress fill uses `max(booked/capacity*track, 32px)` per the spec's min-width note.
- Photos are remote URLs from the DB (picsum seeds) with initials-tile fallback;
  swap for a CDN in production.
- ENG/हिंदी toggle is a client-side dictionary covering all UI strings
  (competition content stays DB-driven; Hindi about-copy ships in the dict).

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

All errors: `{ error: { message, status } }`. Rate limits are split: writes
(join/leave) 300/min/IP, reads 1000/min/IP (env-overridable, bypassed in tests);
the atomic spot-claim — not the limiter — is the oversell guard, so shared-IP
bursts never corrupt data.

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
