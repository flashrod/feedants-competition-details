import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';
import type { CompetitionDetails } from '../api/client';

export function SpotsProgress({ competition }: { competition: CompetitionDetails }) {
  const pct = Math.min(100, competition.spotsPercentFilled);
  const urgent = competition.spotsLeft <= Math.max(5, competition.maxParticipants * 0.05);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.big}>
          {competition.participantCount.toLocaleString()}
          <Text style={styles.muted}> / {competition.maxParticipants.toLocaleString()} joined</Text>
        </Text>
        <Text style={[styles.left, urgent && styles.urgent]}>
          {competition.spotsLeft > 0 ? `${competition.spotsLeft} left` : 'No spots left'}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.sub}>{pct}% filled</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  big: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  muted: { fontWeight: '400', color: theme.colors.muted, fontSize: 13 },
  left: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryDark },
  urgent: { color: theme.colors.warning },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ede6',
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 4 },
  sub: { marginTop: 6, fontSize: 12, color: theme.colors.muted },
});
