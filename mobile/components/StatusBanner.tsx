import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATUS_META, theme } from './theme';
import type { CompetitionDetails } from '../api/client';

export function StatusBanner({ competition }: { competition: CompetitionDetails }) {
  const meta = STATUS_META[competition.status] ?? STATUS_META.upcoming;
  if (competition.status === 'registration_open' && !competition.viewer.isRegistered) {
    return null; // no banner needed in the happy path
  }
  let message: string | null = null;
  if (competition.status === 'cancelled') {
    message = competition.cancelledReason ?? 'This competition was cancelled.';
  } else if (competition.status === 'completed') {
    message = 'This competition has ended. Final standings are locked.';
  } else if (competition.status === 'live') {
    message = 'Competition is live. Scoring updates in real time.';
  } else if (competition.status === 'full' && !competition.viewer.isRegistered) {
    message = 'All spots are taken. Check back if someone withdraws.';
  } else if (competition.viewer.isRegistered) {
    message = "You're registered. Good luck!";
  } else if (competition.viewer.joinDisabledReason) {
    message = competition.viewer.joinDisabledReason;
  }
  if (!message) return null;
  return (
    <View style={[styles.banner, { backgroundColor: meta.bg }]}>
      <Text style={[styles.pill, { backgroundColor: meta.color }]}>{meta.label}</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  text: { color: theme.colors.text, fontSize: 13, lineHeight: 18 },
});
