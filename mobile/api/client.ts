import axios from 'axios';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export type CompetitionStatus =
  | 'registration_open'
  | 'full'
  | 'registration_closed'
  | 'live'
  | 'completed'
  | 'cancelled'
  | 'upcoming';

export interface CompetitionDetails {
  id: string;
  slug: string;
  title: string;
  description: string;
  rules: string[];
  coverImageUrl: string | null;
  gameType: string;
  entryFee: number;
  currency: string;
  prizePool: number;
  prizeBreakdown: { position: string; amount: number }[];
  maxParticipants: number;
  participantCount: number;
  spotsLeft: number;
  spotsPercentFilled: number;
  registrationOpensAt: string;
  registrationDeadline: string;
  startsAt: string;
  endsAt: string;
  status: CompetitionStatus;
  isCancelled: boolean;
  cancelledReason: string | null;
  organizerName: string;
  tags: string[];
  viewer: {
    isRegistered: boolean;
    canJoin: boolean;
    canLeave: boolean;
    joinDisabledReason: string | null;
  };
  serverTime: string;
}

export interface Participant {
  id: string;
  teamName: string | null;
  joinedAt: string;
  user: { id: string; name: string; avatarUrl: string | null } | null;
}

export function newIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createApi(userId: string | null) {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 12_000,
    headers: userId ? { 'x-user-id': userId } : {},
  });

  return {
    async getCompetition(idOrSlug: string): Promise<CompetitionDetails> {
      const res = await client.get('/api/competitions/' + encodeURIComponent(idOrSlug), {
        params: userId ? { userId } : {},
      });
      return res.data.data as CompetitionDetails;
    },
    async listCompetitions(): Promise<CompetitionDetails[]> {
      const res = await client.get('/api/competitions');
      return res.data.data as CompetitionDetails[];
    },
    async getParticipants(
      idOrSlug: string,
      opts?: { limit?: number; cursor?: string | null },
    ): Promise<{ data: Participant[]; pagination: { nextCursor: string | null } }> {
      const res = await client.get(
        `/api/competitions/${encodeURIComponent(idOrSlug)}/participants`,
        { params: { limit: opts?.limit ?? 20, cursor: opts?.cursor ?? undefined } },
      );
      return res.data;
    },
    async join(idOrSlug: string, body: { userId: string; teamName?: string; idempotencyKey: string }) {
      const res = await client.post(
        `/api/competitions/${encodeURIComponent(idOrSlug)}/join`,
        body,
      );
      return res.data.data as CompetitionDetails;
    },
    async leave(idOrSlug: string, userId: string) {
      const res = await client.post(
        `/api/competitions/${encodeURIComponent(idOrSlug)}/leave`,
        { userId },
      );
      return res.data.data as CompetitionDetails;
    },
  };
}

export type Api = ReturnType<typeof createApi>;

export function apiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const msg = (e.response?.data as any)?.error?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    if (e.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (!e.response) return 'Could not reach the server. Is the API running?';
    return `Request failed (${e.response.status})`;
  }
  return e instanceof Error ? e.message : 'Something went wrong';
}
