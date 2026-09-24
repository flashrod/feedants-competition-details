import type { CompetitionDoc } from '../models/Competition.js';

/**
 * Canonical lifecycle. Computed server-side on every read from dates,
 * capacity and the cancel flag so the API can never serve a stale status.
 */
export type CompetitionStatus =
  | 'registration_open'
  | 'full'
  | 'registration_closed'
  | 'live'
  | 'completed'
  | 'cancelled'
  | 'upcoming'; // registration hasn't opened yet

export interface ViewerContext {
  isRegistered: boolean;
  canJoin: boolean;
  canLeave: boolean;
  joinDisabledReason: string | null;
}

export function getCompetitionStatus(
  c: Pick<
    CompetitionDoc,
    | 'isCancelled'
    | 'maxParticipants'
    | 'participantCount'
    | 'registrationOpensAt'
    | 'registrationDeadline'
    | 'startsAt'
    | 'endsAt'
  >,
  now = new Date(),
): CompetitionStatus {
  if (c.isCancelled) return 'cancelled';
  const t = now.getTime();
  if (t >= new Date(c.endsAt).getTime()) return 'completed';
  if (t >= new Date(c.startsAt).getTime()) return 'live';
  if (t < new Date(c.registrationOpensAt).getTime()) return 'upcoming';
  if (t > new Date(c.registrationDeadline).getTime()) return 'registration_closed';
  if (c.participantCount >= c.maxParticipants) return 'full';
  return 'registration_open';
}

export function getViewerContext(
  status: CompetitionStatus,
  isRegistered: boolean,
): ViewerContext {
  if (isRegistered) {
    const canLeave = status === 'registration_open' || status === 'full';
    return {
      isRegistered: true,
      canJoin: false,
      canLeave,
      joinDisabledReason: canLeave ? null : 'Registration is locked for this competition',
    };
  }
  switch (status) {
    case 'registration_open':
      return { isRegistered: false, canJoin: true, canLeave: false, joinDisabledReason: null };
    case 'full':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Competition is full' };
    case 'upcoming':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Registration has not opened yet' };
    case 'registration_closed':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Registration is closed' };
    case 'live':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Competition is live' };
    case 'completed':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Competition has ended' };
    case 'cancelled':
      return { isRegistered: false, canJoin: false, canLeave: false, joinDisabledReason: 'Competition was cancelled' };
  }
}

export function spotsLeft(c: Pick<CompetitionDoc, 'maxParticipants' | 'participantCount'>): number {
  return Math.max(0, c.maxParticipants - c.participantCount);
}
