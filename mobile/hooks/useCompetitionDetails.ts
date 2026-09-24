import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  createApi,
  newIdempotencyKey,
  type CompetitionDetails,
} from '../api/client';

export function useCompetitionDetails(slug: string, userId: string | null) {
  const api = useMemo(() => createApi(userId), [userId]);
  const queryClient = useQueryClient();
  const key = ['competition', slug, userId ?? 'anon'];

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.getCompetition(slug),
    // Countdowns + spots change often near deadlines: poll while open/full.
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === 'registration_open' || s === 'full' ? 15_000 : 60_000;
    },
    retry: 2,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const join: UseMutationResult<CompetitionDetails, Error, { teamName?: string }> =
    useMutation({
      mutationFn: async (vars) => {
        if (!userId) throw new Error('Set a demo user id to join.');
        // Optimistic update: claim a spot locally, roll back on failure.
        await queryClient.cancelQueries({ queryKey: key });
        const prev = queryClient.getQueryData<CompetitionDetails>(key);
        if (prev && prev.spotsLeft > 0) {
          queryClient.setQueryData<CompetitionDetails>(key, {
            ...prev,
            participantCount: prev.participantCount + 1,
            spotsLeft: prev.spotsLeft - 1,
          });
        }
        try {
          return await api.join(slug, {
            userId,
            teamName: vars.teamName,
            idempotencyKey: newIdempotencyKey(),
          });
        } catch (e) {
          if (prev) queryClient.setQueryData(key, prev);
          throw e;
        }
      },
      onSuccess: (data) => queryClient.setQueryData(key, data),
      onSettled: invalidate,
    });

  const leave = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Set a demo user id first.');
      return api.leave(slug, userId);
    },
    onSuccess: (data) => queryClient.setQueryData(key, data),
    onSettled: invalidate,
  });

  return { ...query, join, leave, refresh: invalidate };
}
