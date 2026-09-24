import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Competition } from '../src/models/Competition.js';
import { Participation } from '../src/models/Participation.js';
import { User } from '../src/models/User.js';

let mongod: MongoMemoryServer;
const app = createApp();

function hrs(h: number) {
  return new Date(Date.now() + h * 3600_000);
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('competition lifecycle', () => {
  it('derives status from dates and capacity', async () => {
    const comp = await Competition.create({
      title: 'Status Test',
      slug: `status-${Date.now()}`,
      description: 'x',
      entryFee: 0,
      prizePool: 100,
      maxParticipants: 10,
      participantCount: 0,
      registrationOpensAt: hrs(-1),
      registrationDeadline: hrs(1),
      startsAt: hrs(2),
      endsAt: hrs(4),
    });
    const res = await request(app).get(`/api/competitions/${comp.slug}`).expect(200);
    expect(res.body.data.status).toBe('registration_open');
    expect(res.body.data.spotsLeft).toBe(10);
  });

  it('rejects joins after the deadline with 409', async () => {
    const user = await User.create({ name: 'Late', walletBalance: 50 });
    const comp = await Competition.create({
      title: 'Late Test',
      slug: `late-${Date.now()}`,
      description: 'x',
      entryFee: 0,
      prizePool: 10,
      maxParticipants: 10,
      participantCount: 0,
      registrationOpensAt: hrs(-5),
      registrationDeadline: hrs(-1),
      startsAt: hrs(1),
      endsAt: hrs(3),
    });
    const res = await request(app)
      .post(`/api/competitions/${comp.slug}/join`)
      .send({ userId: String(user._id) });
    expect(res.status).toBe(409);
  });
});

describe('objective detail shape', () => {
  it('serves judge, milestones, winners, rewards and referral blocks', async () => {
    const comp = await Competition.create({
      title: 'Feedants Classical Dance',
      slug: `dance-${Date.now()}`,
      description: 'x',
      entryFee: 99,
      currency: 'INR',
      prizePool: 1500,
      prizeBreakdown: [
        { position: '1st', amount: 550, icon: 'gold' },
        { position: '2nd', amount: 300, icon: 'silver' },
        { position: '3rd', amount: 240, icon: 'bronze' },
        { position: '4th', amount: 200, icon: 'star' },
        { position: '5th', amount: 130, icon: 'star' },
        { position: '6th', amount: 80, icon: 'star' },
      ],
      maxParticipants: 20,
      participantCount: 1,
      registrationOpensAt: hrs(-1),
      registrationDeadline: hrs(30),
      startsAt: hrs(500),
      endsAt: hrs(550),
      submissionStartsAt: hrs(-90),
      submissionEndsAt: hrs(480),
      resultAt: hrs(528),
      judge: { name: 'Manju Dubey', title: 'Professional Kathak Dancer', experience: '12+ Years of Experience' },
      previousWinners: [{ name: 'Riya Shah', rankLabel: '1st Winner' }],
      aboutTabs: { about: ['line one'], judging: ['how judged'], rules: ['rule one'] },
      certificateForWinners: true,
      referralLink: 'https://feedants.com/r/referral123',
      referralEarnPerSignup: 10,
    });
    const res = await request(app).get(`/api/competitions/${comp.slug}`).expect(200);
    const d = res.body.data;
    expect(d.status).toBe('registration_open');
    expect(d.capacity).toBe(20);
    expect(d.booked).toBe(1);
    expect(d.spotsLeft).toBe(19);
    expect(d.judge.name).toBe('Manju Dubey');
    expect(d.milestones.registerBefore).toBeTruthy();
    expect(d.milestones.result).toBeTruthy();
    expect(d.previousWinners).toHaveLength(1);
    expect(d.rewards).toHaveLength(6);
    expect(d.rewards.reduce((s: number, r: any) => s + r.amount, 0)).toBe(d.prizePool);
    expect(d.referral.link).toContain('feedants.com/r/');
    expect(d.aboutTabs.about).toHaveLength(1);
  });
});

describe('concurrent joins never oversell', () => {
  it('50 users racing for 10 spots => exactly 10 registered', async () => {
    const comp = await Competition.create({
      title: 'Race Test',
      slug: `race-${Date.now()}`,
      description: 'x',
      entryFee: 0,
      prizePool: 100,
      maxParticipants: 10,
      participantCount: 0,
      registrationOpensAt: hrs(-1),
      registrationDeadline: hrs(2),
      startsAt: hrs(3),
      endsAt: hrs(5),
    });
    const users = await User.insertMany(
      Array.from({ length: 50 }, (_, i) => ({ name: `Racer ${i}`, walletBalance: 10 })),
    );
    const results = await Promise.all(
      users.map((u) =>
        request(app).post(`/api/competitions/${comp.slug}/join`).send({ userId: String(u._id) }),
      ),
    );
    const ok = results.filter((r) => r.status === 201).length;
    const conflict = results.filter((r) => r.status === 409).length;
    expect(ok).toBe(10);
    expect(conflict).toBe(40);

    const fresh = await Competition.findById(comp._id).lean();
    expect(fresh?.participantCount).toBe(10);
    const count = await Participation.countDocuments({ competitionId: comp._id, status: 'registered' });
    expect(count).toBe(10);
  }, 60_000);

  it('double join returns 409 and does not double-count', async () => {
    const user = await User.create({ name: 'Double', walletBalance: 50 });
    const comp = await Competition.create({
      title: 'Double Test',
      slug: `double-${Date.now()}`,
      description: 'x',
      entryFee: 0,
      prizePool: 10,
      maxParticipants: 10,
      participantCount: 0,
      registrationOpensAt: hrs(-1),
      registrationDeadline: hrs(2),
      startsAt: hrs(3),
      endsAt: hrs(5),
    });
    await request(app)
      .post(`/api/competitions/${comp.slug}/join`)
      .send({ userId: String(user._id) })
      .expect(201);
    await request(app)
      .post(`/api/competitions/${comp.slug}/join`)
      .send({ userId: String(user._id) })
      .expect(409);
    const fresh = await Competition.findById(comp._id).lean();
    expect(fresh?.participantCount).toBe(1);
  });
});
