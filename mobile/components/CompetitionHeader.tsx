import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATUS_META, theme } from './theme';
import type { CompetitionDetails } from '../api/client';

export function CompetitionHeader({ competition }: { competition: CompetitionDetails }) {
  const meta = STATUS_META[competition.status] ?? STATUS_META.upcoming;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={styles.gameType}>{competition.gameType.toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>{competition.title}</Text>
      <Text style={styles.org}>by {competition.organizerName}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {competition.entryFee === 0
              ? 'FREE'
              : `${competition.currency} ${competition.entryFee}`}
          </Text>
          <Text style={styles.statLabel}>Entry fee</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.prize]}>
            {competition.currency} {competition.prizePool.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Prize pool</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{competition.maxParticipants.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Max spots</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontWeight: '700', fontSize: 12 },
  gameType: { fontSize: 11, color: theme.colors.muted, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 10, lineHeight: 28 },
  org: { color: theme.colors.muted, marginTop: 2, fontSize: 13 },
  stats: { flexDirection: 'row', marginTop: 14, alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  prize: { color: theme.colors.primaryDark },
  statLabel: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: theme.colors.border },
});
