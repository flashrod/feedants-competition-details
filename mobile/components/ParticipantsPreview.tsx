import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';
import type { Participant } from '../api/client';
import { createApi } from '../api/client';

export function ParticipantsPreview({
  slug,
  total,
  userId,
}: {
  slug: string;
  total: number;
  userId: string | null;
}) {
  const [rows, setRows] = useState<Participant[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    createApi(userId)
      .getParticipants(slug, { limit: 5 })
      .then((r) => alive && setRows(r.data))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [slug, userId, total]);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Participants ({total.toLocaleString()})</Text>
      {!rows && !failed && <ActivityIndicator />}
      {failed && <Text style={styles.muted}>Could not load participants.</Text>}
      {rows?.map((p) => (
        <View key={p.id} style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(p.user?.name ?? p.teamName ?? '?').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{p.user?.name ?? 'Player'}</Text>
            {p.teamName && <Text style={styles.muted}>{p.teamName}</Text>}
          </View>
        </View>
      ))}
      {rows && rows.length === 0 && <Text style={styles.muted}>Be the first to join!</Text>}
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
  heading: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  muted: { fontSize: 13, color: theme.colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', color: theme.colors.primaryDark },
  name: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
});
