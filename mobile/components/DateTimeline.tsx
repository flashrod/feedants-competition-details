import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';
import { formatCountdown, useCountdown } from '../hooks/useCountdown';
import type { CompetitionDetails } from '../api/client';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DateTimeline({ competition }: { competition: CompetitionDetails }) {
  // Pick the most relevant upcoming milestone for the countdown.
  const target =
    competition.status === 'registration_open' || competition.status === 'full'
      ? competition.registrationDeadline
      : competition.status === 'upcoming'
        ? competition.registrationOpensAt
        : competition.status === 'live'
          ? competition.endsAt
          : null;
  const label =
    competition.status === 'registration_open' || competition.status === 'full'
      ? 'Registration closes in'
      : competition.status === 'upcoming'
        ? 'Registration opens in'
        : competition.status === 'live'
          ? 'Competition ends in'
          : null;
  const cd = useCountdown(target);

  return (
    <View style={styles.card}>
      {label && cd && (
        <View style={styles.countdown}>
          <Text style={styles.cdLabel}>{label}</Text>
          <Text style={styles.cdValue}>{formatCountdown(cd)}</Text>
        </View>
      )}
      {[
        ['Registration opens', competition.registrationOpensAt],
        ['Registration closes', competition.registrationDeadline],
        ['Starts', competition.startsAt],
        ['Ends', competition.endsAt],
      ].map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.k}>{k}</Text>
          <Text style={styles.v}>{fmtDate(v as string)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countdown: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  cdLabel: { fontSize: 12, color: theme.colors.muted },
  cdValue: { fontSize: 20, fontWeight: '800', color: theme.colors.primaryDark, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  k: { fontSize: 13, color: theme.colors.muted },
  v: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
});
