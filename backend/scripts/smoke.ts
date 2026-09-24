import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { seed } from './seed.js';

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());
const { demoUserId, competitions } = await seed();
const app = createApp();

console.log(`demoUser=${demoUserId}`);
for (const c of competitions) {
  const d = await request(app)
    .get(`/api/competitions/${c.slug}`)
    .query({ userId: demoUserId });
  const b = d.body.data;
  console.log(`${b.slug}: status=${b.status} spotsLeft=${b.spotsLeft} registered=${b.viewer.isRegistered} canJoin=${b.viewer.canJoin}`);
}

// Join the almost-full sprint with a fresh user, then verify second join 409s,
// then leave and verify the spot is freed.
const users = await request(app).get('/api/users');
const other = users.body.data.find((u: any) => u.id !== demoUserId);
const j1 = await request(app).post('/api/competitions/last-minute-sprint/join').send({ userId: other.id, teamName: 'Sprinters' });
console.log(`join sprint: ${j1.status} spotsLeft=${j1.body.data?.spotsLeft}`);
const j2 = await request(app).post('/api/competitions/last-minute-sprint/join').send({ userId: other.id });
console.log(`re-join sprint: ${j2.status} (${j2.body.error?.message})`);
const lv = await request(app).post('/api/competitions/last-minute-sprint/leave').send({ userId: other.id });
console.log(`leave sprint: ${lv.status} spotsLeft=${lv.body.data?.spotsLeft}`);
const part = await request(app).get('/api/competitions/weekend-mega-clash/participants').query({ limit: 3 });
console.log(`participants preview: ${part.body.data.length} rows, nextCursor=${part.body.pagination.nextCursor ? 'yes' : 'no'}`);

await mongoose.disconnect();
await mongod.stop();
console.log('SMOKE OK');
