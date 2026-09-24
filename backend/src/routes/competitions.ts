import { Router, type Request } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Competition } from '../models/Competition.js';
import { Participation } from '../models/Participation.js';
import { User } from '../models/User.js';
import { getCompetitionStatus, getViewerContext, spotsLeft } from '../utils/status.js';
import { httpError } from '../middleware/errors.js';

export const competitionsRouter = Router();

function viewerId(req: Request): string | null {
  const raw = req.header('x-user-id') ?? (req.query.userId as string | undefined) ?? null;
  if (!raw || !mongoose.isValidObjectId(raw)) return null;
  return raw;
}

function findFilter(idOrSlug: string) {
  return mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };
}

function toDetailJson(comp: any, isRegistered: boolean, now = new Date()) {
  const status = getCompetitionStatus(comp, now);
  const ctx = getViewerContext(status, isRegistered);
  const left = spotsLeft(comp);
  return {
    id: String(comp._id),
    slug: comp.slug,
    title: comp.title,
    description: comp.description,
    rules: comp.rules ?? [],
    coverImageUrl: comp.coverImageUrl,
    gameType: comp.gameType,
    entryFee: comp.entryFee,
    currency: comp.currency,
    prizePool: comp.prizePool,
    prizeBreakdown: comp.prizeBreakdown ?? [],
    maxParticipants: comp.maxParticipants,
    participantCount: comp.participantCount,
    spotsLeft: left,
    spotsPercentFilled: comp.maxParticipants
      ? Math.round((comp.participantCount / comp.maxParticipants) * 100)
      : 0,
    registrationOpensAt: comp.registrationOpensAt,
    registrationDeadline: comp.registrationDeadline,
    startsAt: comp.startsAt,
    endsAt: comp.endsAt,
    status,
    isCancelled: comp.isCancelled,
    cancelledReason: comp.cancelledReason,
    organizerName: comp.organizerName,
    tags: comp.tags ?? [],
    viewer: ctx,
    serverTime: now.toISOString(),
  };
}

// GET /api/competitions — lightweight list for navigation / testing
competitionsRouter.get('/', async (_req, res, next) => {
  try {
    const comps = await Competition.find({}).sort({ startsAt: 1 }).limit(50).lean();
    const now = new Date();
    res.json({
      data: comps.map((c: any) => toDetailJson(c, false, now)),
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/competitions/:idOrSlug
competitionsRouter.get('/:idOrSlug', async (req, res, next) => {
  try {
    const comp = await Competition.findOne(findFilter(req.params.idOrSlug)).lean();
    if (!comp) throw httpError(404, 'Competition not found');
    const uid = viewerId(req);
    let isRegistered = false;
    if (uid) {
      const p = await Participation.findOne({
        competitionId: comp._id,
        userId: uid,
        status: 'registered',
      }).lean();
      isRegistered = Boolean(p);
    }
    res.json({ data: toDetailJson(comp, isRegistered) });
  } catch (e) {
    next(e);
  }
});

// GET /api/competitions/:id/participants?limit=&cursor=
competitionsRouter.get('/:idOrSlug/participants', async (req, res, next) => {
  try {
    const comp = await Competition.findOne(findFilter(req.params.idOrSlug)).lean();
    if (!comp) throw httpError(404, 'Competition not found');
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
    const cursor = req.query.cursor as string | undefined;
    const query: Record<string, unknown> = {
      competitionId: comp._id,
      status: 'registered',
    };
    if (cursor && mongoose.isValidObjectId(cursor)) {
      query._id = { $gt: new mongoose.Types.ObjectId(cursor) };
    }
    const rows = await Participation.find(query)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .populate('userId', 'name avatarUrl')
      .lean();
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    res.json({
      data: page.map((r: any) => ({
        id: String(r._id),
        teamName: r.teamName,
        joinedAt: (r as any).joinedAt,
        user: r.userId
          ? { id: String((r.userId as any)._id), name: (r.userId as any).name, avatarUrl: (r.userId as any).avatarUrl }
          : null,
      })),
      pagination: {
        nextCursor: hasMore ? String(page[page.length - 1]._id) : null,
      },
    });
  } catch (e) {
    next(e);
  }
});

const joinSchema = z.object({
  userId: z.string().min(1),
  teamName: z.string().trim().min(2).max(40).optional(),
  idempotencyKey: z.string().max(100).optional(),
});

/**
 * POST /api/competitions/:id/join
 *
 * Concurrency-safe join:
 *  1. Validate lifecycle + capacity from a fresh read.
 *  2. Atomically claim a spot with a conditional $inc
 *     (participantCount < maxParticipants AND registration still open).
 *  3. Create/reactivate the Participation row. On duplicate (already joined)
 *     the claimed spot is refunded.
 *  4. If anything after the claim fails, refund the spot (compensation).
 *
 * In production on a replica set, wrap steps 2-3 in a transaction. The
 * conditional increment + compensation below is safe on standalone Mongo too
 * and never oversells.
 */
competitionsRouter.post('/:idOrSlug/join', async (req, res, next) => {
  try {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) throw httpError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    const { userId, teamName, idempotencyKey } = parsed.data;
    if (!mongoose.isValidObjectId(userId)) throw httpError(400, 'Invalid userId');
    const headerUser = req.header('x-user-id');
    if (headerUser && headerUser !== userId) throw httpError(403, 'userId mismatch');

    const comp = await Competition.findOne(findFilter(req.params.idOrSlug));
    if (!comp) throw httpError(404, 'Competition not found');

    // Idempotent retry: same key returns the existing registration.
    if (idempotencyKey) {
      const existing = await Participation.findOne({ competitionId: comp._id, idempotencyKey }).lean();
      if (existing && String((existing as any).userId) === userId) {
        const fresh = await Competition.findById(comp._id).lean();
        return res.status(200).json({ data: toDetailJson(fresh, true), idempotentReplay: true });
      }
    }

    const now = new Date();

    // Already-registered check comes first so a member who re-taps Join gets
    // "Already joined" even if the competition filled up afterwards.
    const already = await Participation.findOne({
      competitionId: comp._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'registered',
    }).lean();
    if (already) throw httpError(409, 'Already joined this competition');

    const status = getCompetitionStatus(comp, now);
    if (status !== 'registration_open') {
      const reason =
        status === 'full' ? 'Competition is full'
        : status === 'cancelled' ? 'Competition was cancelled'
        : status === 'completed' ? 'Competition has ended'
        : status === 'live' ? 'Competition is live'
        : status === 'upcoming' ? 'Registration has not opened yet'
        : 'Registration is closed';
      throw httpError(409, reason);
    }

    const user = await User.findById(userId);
    if (!user) throw httpError(404, 'User not found');
    if (user.walletBalance < comp.entryFee) throw httpError(402, 'Insufficient wallet balance');

    // 1) Claim a spot atomically — the guard that prevents oversell.
    const claimed = await Competition.findOneAndUpdate(
      {
        _id: comp._id,
        isCancelled: false,
        participantCount: { $lt: comp.maxParticipants },
        registrationOpensAt: { $lte: now },
        registrationDeadline: { $gte: now },
        startsAt: { $gt: now },
      },
      { $inc: { participantCount: 1 } },
      { new: true },
    ).lean();
    if (!claimed) {
      // Lost the race (filled up / deadline passed between read and write).
      const fresh = await Competition.findById(comp._id).lean();
      const s = fresh ? getCompetitionStatus(fresh, new Date()) : status;
      throw httpError(409, s === 'full' ? 'Competition just filled up' : 'Registration is no longer open');
    }

    // 2) Create (or reactivate) the participation row.
    try {
      await Participation.findOneAndUpdate(
        { competitionId: comp._id, userId: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            status: 'registered',
            teamName: teamName ?? null,
            idempotencyKey: idempotencyKey ?? null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      // Mock wallet deduction (production: ledger transaction).
      if (comp.entryFee > 0) {
        await User.updateOne({ _id: userId }, { $inc: { walletBalance: -comp.entryFee } });
      }
    } catch (e: any) {
      // Compensation: refund the claimed spot.
      await Competition.updateOne({ _id: comp._id }, { $inc: { participantCount: -1 } });
      if (e?.code === 11000) throw httpError(409, 'Already joined this competition');
      throw e;
    }

    const fresh = await Competition.findById(comp._id).lean();
    res.status(201).json({ data: toDetailJson(fresh, true) });
  } catch (e) {
    next(e);
  }
});

const leaveSchema = z.object({ userId: z.string().min(1) });

// POST /api/competitions/:id/leave — withdraw; frees exactly one spot.
competitionsRouter.post('/:idOrSlug/leave', async (req, res, next) => {
  try {
    const parsed = leaveSchema.safeParse(req.body);
    if (!parsed.success) throw httpError(400, 'Invalid body');
    const { userId } = parsed.data;
    if (!mongoose.isValidObjectId(userId)) throw httpError(400, 'Invalid userId');

    const comp = await Competition.findOne(findFilter(req.params.idOrSlug));
    if (!comp) throw httpError(404, 'Competition not found');

    const now = new Date();
    const status = getCompetitionStatus(comp, now);
    if (status === 'live' || status === 'completed' || status === 'cancelled') {
      throw httpError(409, 'Cannot leave a competition that has started or ended');
    }

    const removed = await Participation.findOneAndUpdate(
      {
        competitionId: comp._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'registered',
      },
      { $set: { status: 'withdrawn' } },
      { new: true },
    );
    if (!removed) throw httpError(404, 'Registration not found');

    const updated = await Competition.findOneAndUpdate(
      { _id: comp._id, participantCount: { $gt: 0 } },
      { $inc: { participantCount: -1 } },
      { new: true },
    ).lean();

    res.json({ data: toDetailJson(updated ?? comp, false) });
  } catch (e) {
    next(e);
  }
});
