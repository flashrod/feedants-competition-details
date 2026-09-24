import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';
import type { CompetitionDetails } from '../api/client';

export function PrizeCard({ competition }: { competition: CompetitionDetails }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Prize breakdown</Text>
      <Text style={styles.pool}>
        {competition.currency} {competition.prizePool.toLocaleString()}
      </Text>
      {competition.prizeBreakdown.length === 0 && (
        <Text style={styles.muted}>Winner announcement after the competition ends.</Text>
      )}
      {competition.prizeBreakdown.map((p, i) => (
        <View key={`${p.position}-${i}`} style={styles.row}>
          <Text style={styles.pos}>{p.position}</Text>
          <Text style={styles.amt}>
            {competition.currency} {p.amount.toLocaleString()}
          </Text>
        </View>
      ))}
      <View style={styles.feeRow}>
        <Text style={styles.muted}>
          Entry {competition.entryFee === 0 ? 'is free' : `costs ${competition.currency} ${competition.entryFee}`}
        </Text>
      </View>
    </View>
  );
}

export function AboutCard({ competition }: { competition: CompetitionDetails }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>About this competition</Text>
      <Text style={styles.body}>{competition.description}</Text>
      {competition.tags.length > 0 && (
        <View style={styles.tags}>
          {competition.tags.map((t) => (
            <Text key={t} style={styles.tag}>#{t}</Text>
          ))}
        </View>
      )}
      {competition.rules.length > 0 && (
        <View style={styles.rules}>
          <Text style={styles.heading}>Rules</Text>
          {competition.rules.map((r, i) => (
            <Text key={i} style={styles.rule}>• {r}</Text>
          ))}
        </View>
      )}
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
  heading: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 6 },
  pool: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pos: { fontSize: 13, color: theme.colors.text, fontWeight: '600' },
  amt: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  feeRow: { marginTop: 8 },
  muted: { fontSize: 13, color: theme.colors.muted },
  body: { fontSize: 14, lineHeight: 20, color: theme.colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  rules: { marginTop: 12 },
  rule: { fontSize: 13, color: theme.colors.text, lineHeight: 19, marginTop: 3 },
});
