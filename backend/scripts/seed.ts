import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { Competition } from '../src/models/Competition.js';
import { Participation } from '../src/models/Participation.js';
import { User } from '../src/models/User.js';

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3600_000);
}

/** Seeds one competition per lifecycle state + demo users. Idempotent. */
export async function seed() {
  await Competition.deleteMany({});
  await Participation.deleteMany({});
  await User.deleteMany({});

  const users = await User.insertMany([
    { name: 'Demo User', avatarUrl: null, walletBalance: 500 },
    { name: 'Aarav Patel', walletBalance: 200 },
    { name: 'Maya Chen', walletBalance: 200 },
    { name: 'Leo Martins', walletBalance: 200 },
  ]);
  const [demo] = users;

  const base = {
    organizerName: 'Feedants',
    currency: 'USD',
    tags: ['fantasy', 'premier-league'],
    coverImageUrl: null,
    gameType: 'fantasy' as const,
  };

  const competitions = await Competition.insertMany([
    {
      ...base,
      title: 'Weekend Mega Clash — $10K Prize Pool',
      slug: 'weekend-mega-clash',
      description:
        'Pick your best XI for the weekend fixtures. Top 100 managers split a $10,000 prize pool. Entries close 1 hour before kickoff.',
      rules: [
        'Pick 11 players within the salary cap.',
        'Entries close 1 hour before the first match.',
        'Top 100 point scorers share the prize pool.',
        'Withdrawals allowed until registration closes.',
      ],
      entryFee: 10,
      prizePool: 10000,
      prizeBreakdown: [
        { position: '1st', amount: 2500 },
        { position: '2nd', amount: 1200 },
        { position: '3rd', amount: 800 },
        { position: '4th–100th', amount: 5500 },
      ],
      maxParticipants: 5000,
      participantCount: 3247,
      registrationOpensAt: hoursFromNow(-72),
      registrationDeadline: hoursFromNow(26),
      startsAt: hoursFromNow(27),
      endsAt: hoursFromNow(75),
      isFeatured: true,
    },
    {
      ...base,
      title: 'Last-Minute Sprint (Almost Full)',
      slug: 'last-minute-sprint',
      description: 'A 50-seat turbo competition. Only a few spots left.',
      rules: ['Winner takes all.', 'No withdrawals in the last 10 minutes.'],
      entryFee: 5,
      prizePool: 200,
      prizeBreakdown: [{ position: '1st', amount: 200 }],
      maxParticipants: 50,
      participantCount: 49,
      registrationOpensAt: hoursFromNow(-5),
      registrationDeadline: hoursFromNow(2),
      startsAt: hoursFromNow(3),
      endsAt: hoursFromNow(8),
    },
    {
      ...base,
      title: 'Monday Night Live',
      slug: 'monday-night-live',
      description: 'This competition is currently live.',
      rules: ['Live scoring.', 'No new entries after kickoff.'],
      entryFee: 0,
      prizePool: 500,
      prizeBreakdown: [{ position: '1st', amount: 500 }],
      maxParticipants: 1000,
      participantCount: 812,
      registrationOpensAt: hoursFromNow(-50),
      registrationDeadline: hoursFromNow(-26),
      startsAt: hoursFromNow(-25),
      endsAt: hoursFromNow(2),
    },
    {
      ...base,
      title: 'Season Champions 2025 (Completed)',
      slug: 'season-champions-2025',
      description: 'Completed last season. Winners have been paid out.',
      rules: ['Final standings are locked.'],
      entryFee: 20,
      prizePool: 50000,
      prizeBreakdown: [{ position: '1st', amount: 15000 }],
      maxParticipants: 2000,
      participantCount: 2000,
      registrationOpensAt: hoursFromNow(-24 * 60),
      registrationDeadline: hoursFromNow(-24 * 58),
      startsAt: hoursFromNow(-24 * 57),
      endsAt: hoursFromNow(-24 * 30),
    },
  ]);

  // Demo user is registered for the featured competition.
  await Participation.create({
    competitionId: competitions[0]._id,
    userId: demo._id,
    status: 'registered',
    teamName: 'Demo XI',
  });

  // Feedants Classical Dance — pixel-spec Objective screen competition.
  // Countdown in the reference reads 01d:06h:28m:32s, so the registration
  // deadline is seeded relative to now to keep it live.
  const regClose = new Date(Date.now() + ((1 * 24 + 6) * 3600 + 28 * 60 + 32) * 1000);
  const dance = await Competition.create({
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    description: 'This is an online classical dance competition open for all age groups.',
    rules: [
      'Open for all age groups.',
      'One submission per participant.',
      'Only contributions from paid participants will be considered for judging.',
    ],
    organizerName: 'Feedants',
    currency: 'INR',
    tags: ['Dance', 'Multi-Win'],
    gameType: 'fantasy',
    certificateForWinners: true,
    entryFee: 99,
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
    registrationOpensAt: hoursFromNow(-24 * 5),
    registrationDeadline: regClose,
    // Lifecycle phases: live once submissions end, completed after results.
    startsAt: new Date(regClose.getTime() + 20 * 24 * 3600_000 + 5 * 60_000),
    endsAt: new Date(regClose.getTime() + 22 * 24 * 3600_000 + 60 * 60_000),
    submissionStartsAt: new Date(regClose.getTime() - (4 * 24 * 3600 + 19 * 3600 + 50 * 60) * 1000),
    submissionEndsAt: new Date(regClose.getTime() + 20 * 24 * 3600_000 + 5 * 60_000),
    resultAt: new Date(regClose.getTime() + 22 * 24 * 3600_000),
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      photoUrl: 'https://picsum.photos/seed/feedants-judge-manju/400/400',
      introVideoUrl: null,
    },
    previousWinners: [
      { name: 'Riya Shah', rankLabel: '1st Winner', thumbUrl: 'https://picsum.photos/seed/feedants-winner-riya/200/200' },
      { name: 'Aarav Mehta', rankLabel: '1st Winner', thumbUrl: 'https://picsum.photos/seed/feedants-winner-aarav/200/200' },
      { name: 'Neha Verma', rankLabel: '2nd Winner', thumbUrl: 'https://picsum.photos/seed/feedants-winner-neha/200/200' },
      { name: 'Ishita Chopra', rankLabel: '3rd Winner', thumbUrl: 'https://picsum.photos/seed/feedants-winner-ishita/200/200' },
    ],
    aboutTabs: {
      about: [
        'This is an online classical dance competition open for all age groups.',
        'Participate from anywhere and showcase your talent.',
        'Express your passion through traditional dance.',
      ],
      judging: [
        'Performances are scored on technique, expression and stage presence.',
        'Only contributions from paid participants will be considered for judging.',
        'The judge’s decision is final and binding.',
      ],
      rules: [
        'Open for all age groups.',
        'One submission per participant.',
        'Submit your video before the submission deadline.',
      ],
    },
    referralLink: 'https://feedants.com/r/referral123',
    referralEarnPerSignup: 10,
  });
  await Participation.create({
    competitionId: dance._id,
    userId: users[1]._id,
    status: 'registered',
    teamName: 'Kathak Beats',
  });

  return { demoUserId: String(demo._id), competitions: [...competitions, dance] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const uri = process.argv[2] ?? env.mongoUri;
  await connectDb(uri);
  const result = await seed();
  // eslint-disable-next-line no-console
  console.log(`Seeded. Demo user: ${result.demoUserId}`);
  // eslint-disable-next-line no-console
  console.log(result.competitions.map((c) => ` - ${c.slug}`).join('\n'));
  await disconnectDb();
  await mongoose.disconnect();
}
