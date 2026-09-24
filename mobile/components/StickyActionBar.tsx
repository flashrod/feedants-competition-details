import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from './theme';
import type { CompetitionDetails } from '../api/client';

export function StickyActionBar({
  competition,
  joining,
  leaving,
  onJoin,
  onLeave,
}: {
  competition: CompetitionDetails;
  joining: boolean;
  leaving: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  const { viewer, status, entryFee, currency } = competition;
  const busy = joining || leaving;

  if (viewer.isRegistered) {
    return (
      <View style={styles.bar}>
        <View style={styles.registered}>
          <Text style={styles.registeredText}>You're in ✓</Text>
        </View>
        <TouchableOpacity
          style={[styles.secondary, !viewer.canLeave && styles.disabled]}
          disabled={!viewer.canLeave || busy}
          onPress={onLeave}
        >
          {leaving ? <ActivityIndicator color={theme.colors.primaryDark} /> : <Text style={styles.secondaryText}>Leave</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  const label = viewer.canJoin
    ? entryFee === 0
      ? 'Join for Free'
      : `Join • ${currency} ${entryFee}`
    : (viewer.joinDisabledReason ?? 'Unavailable');

  return (
    <View style={styles.bar}>
      <View style={styles.priceBox}>
        <Text style={styles.price}>
          {entryFee === 0 ? 'FREE' : `${currency} ${entryFee}`}
        </Text>
        <Text style={styles.perSpot}>entry fee</Text>
      </View>
      <TouchableOpacity
        style={[styles.primary, (!viewer.canJoin || busy) && styles.disabled]}
        disabled={!viewer.canJoin || busy}
        onPress={onJoin}
      >
        {joining ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>{status === 'live' ? 'View Live' : label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceBox: { justifyContent: 'center', minWidth: 80 },
  price: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  perSpot: { fontSize: 12, color: theme.colors.muted },
  primary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondary: {
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryText: { color: theme.colors.primaryDark, fontWeight: '800' },
  registered: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registeredText: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.45 },
});
