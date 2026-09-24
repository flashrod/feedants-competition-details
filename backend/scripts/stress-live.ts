/**
 * Live-API stress loop. Hits a RUNNING server (default localhost:4000) and its
 * Mongo, creates throwaway competitions/users, hammers them, asserts exact
 * counter consistency, then cleans up. Run N iterations until perfect.
 *
 * Usage: npx tsx scripts/stress-live.ts [baseUrl] [iterations]
 */
import mongoose from 'mongoose';
import { Competition } from '../src/models/Competition.js';
import { Participation } from '../src/models/Participation.js';
import { User } from '../src/models/User.js';

const BASE = process.argv[2] ?? 'http://localhost:4000';
const ITERS = Number(process.argv[3] ?? 3);
const MONGO = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/feedants';

let failures = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name} ${extra}`);
  }
}

async function post(path: string, body: unknown) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await r.json();
  } catch { /* non-json */ }
  return { status: r.status, json };
}

async function iteration(n: number) {
  console.log(`--- iteration ${n} ---`);
  const tag = `stress${Date.now()}${n}`;
  const now = Date.now();
  const H = 3600_000;

  const comp = await Competition.create({
    title: `Stress ${tag}`,
    slug: `stress-${tag}`,
    description: 'throwaway',
    entryFee: 0,
    prizePool: 100,
    maxParticipants: 10,
    participantCount: 0,
    registrationOpensAt: new Date(now - H),
    registrationDeadline: new Date(now + 2 * H),
    startsAt: new Date(now + 3 * H),
    endsAt: new Date(now + 5 * H),
  });

  const users = await User.insertMany(
    Array.from({ length: 30 }, (_, i) => ({ name: `S${n}-${i}`, walletBalance: 10 })),
  );
  const ids = users.map((u) => String(u._id));

  // 1) 30-way race for 10 spots.
  const results = await Promise.all(
    ids.map((id) => post(`/api/competitions/${comp.slug}/join`, { userId: id })),
  );
  const ok = results.filter((r) => r.status === 201).length;
  const denied = results.filter((r) => r.status === 409).length;
  check('race: exactly 10 admitted', ok === 10, `got ${ok}`);
  check('race: exactly 20 rejected', denied === 20, `got ${denied}`);

  const fresh = await Competition.findById(comp._id).lean();
  const rows = await Participation.countDocuments({ competitionId: comp._id, status: 'registered' });
  check('counter == 10', fresh?.participantCount === 10, `got ${fresh?.participantCount}`);
  check('rows == 10', rows === 10, `got ${rows}`);

  const winners = (
    await Participation.find({ competitionId: comp._id, status: 'registered' }).lean()
  ).map((p: any) => String(p.userId));

  // 2) Winners re-joining get "Already joined", counter untouched.
  const rej = await Promise.all(winners.map((id) => post(`/api/competitions/${comp.slug}/join`, { userId: id })));
  check('rejoin all 409', rej.every((r) => r.status === 409), JSON.stringify(rej.map((r) => r.status)));
  check(
    'rejoin message exact',
    rej.every((r) => r.json?.error?.message === 'Already joined this competition'),
  );
  const after = await Competition.findById(comp._id).lean();
  check('counter still 10', after?.participantCount === 10, `got ${after?.participantCount}`);

  // 3) 4 leave, 4 fresh join -> back to 10.
  const leavers = winners.slice(0, 4);
  const newcomers = ids.filter((id) => !winners.includes(id)).slice(0, 4);
  for (const id of leavers) {
    const r = await post(`/api/competitions/${comp.slug}/leave`, { userId: id });
    check(`leave ${id.slice(-4)} -> 200`, r.status === 200, `got ${r.status}`);
  }
  const mid = await Competition.findById(comp._id).lean();
  check('counter == 6 after leaves', mid?.participantCount === 6, `got ${mid?.participantCount}`);
  const joins2 = await Promise.all(newcomers.map((id) => post(`/api/competitions/${comp.slug}/join`, { userId: id })));
  check('4 newcomers admitted', joins2.every((r) => r.status === 201));
  const end = await Competition.findById(comp._id).lean();
  const rowsEnd = await Participation.countDocuments({ competitionId: comp._id, status: 'registered' });
  check('counter == 10 again', end?.participantCount === 10, `got ${end?.participantCount}`);
  check('rows == 10 again', rowsEnd === 10, `got ${rowsEnd}`);

  // 4) Leave by non-member -> 404; bad userId -> 400.
  const ghost = await post(`/api/competitions/${comp.slug}/leave`, { userId: new mongoose.Types.ObjectId().toString() });
  check('leave non-member 404', ghost.status === 404, `got ${ghost.status}`);
  const bad = await post(`/api/competitions/${comp.slug}/join`, { userId: 'nope' });
  check('bad userId 400', bad.status === 400, `got ${bad.status}`);

  // 5) Idempotency replay on a fresh comp.
  const comp2 = await Competition.create({
    title: `Idem ${tag}`,
    slug: `idem-${tag}`,
    description: 'throwaway',
    entryFee: 0,
    prizePool: 10,
    maxParticipants: 5,
    participantCount: 0,
    registrationOpensAt: new Date(now - H),
    registrationDeadline: new Date(now + 2 * H),
    startsAt: new Date(now + 3 * H),
    endsAt: new Date(now + 5 * H),
  });
  const key = `key-${tag}`;
  const first = await post(`/api/competitions/${comp2.slug}/join`, { userId: ids[0], idempotencyKey: key });
  const replay = await post(`/api/competitions/${comp2.slug}/join`, { userId: ids[0], idempotencyKey: key });
  check('first join 201', first.status === 201, `got ${first.status}`);
  check('replay 200 + flag', replay.status === 200 && replay.json?.idempotentReplay === true, `got ${replay.status}`);
  const comp2Fresh = await Competition.findById(comp2._id).lean();
  check('idempotent: counter == 1', comp2Fresh?.participantCount === 1, `got ${comp2Fresh?.participantCount}`);

  // cleanup
  await Participation.deleteMany({ competitionId: { $in: [comp._id, comp2._id] } });
  await Competition.deleteMany({ _id: { $in: [comp._id, comp2._id] } });
  await User.deleteMany({ _id: { $in: users.map((u) => u._id) } });
}

await mongoose.connect(MONGO);
for (let i = 1; i <= ITERS; i++) {
  await iteration(i);
}
await mongoose.disconnect();

if (failures > 0) {
  console.log(`STRESS RESULT: ${failures} FAILURES`);
  process.exit(1);
}
console.log(`STRESS RESULT: PERFECT (${ITERS}/${ITERS} iterations)`);
