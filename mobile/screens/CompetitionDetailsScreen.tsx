import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';
import { apiErrorMessage } from '../api/client';
import { theme } from '../components/theme';
import { StatusBanner } from '../components/StatusBanner';
import { CompetitionHeader } from '../components/CompetitionHeader';
import { SpotsProgress } from '../components/SpotsProgress';
import { DateTimeline } from '../components/DateTimeline';
import { AboutCard, PrizeCard } from '../components/InfoCards';
import { ParticipantsPreview } from '../components/ParticipantsPreview';
import { StickyActionBar } from '../components/StickyActionBar';

export function CompetitionDetailsScreen({
  slug,
  userId,
}: {
  slug: string;
  userId: string | null;
}) {
  const { data, isLoading, isError, error, refetch, isRefetching, join, leave } =
    useCompetitionDetails(slug, userId);
  const [teamName, setTeamName] = useState('');

  const confirm = (title: string, message: string, onOk: () => void) => {
    Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: onOk }]);
  };

  const handleJoin = () => {
    if (!userId) {
      Alert.alert('Demo user required', 'Paste EXPO_PUBLIC_DEMO_USER_ID (printed by backend seed) into the user field above.');
      return;
    }
    const run = () =>
      join.mutate(
        { teamName: teamName.trim() || undefined },
        { onError: (e) => Alert.alert('Could not join', apiErrorMessage(e)) },
      );
    if (data && data.entryFee > 0) {
      confirm('Join competition?', `Entry fee is ${data.currency} ${data.entryFee}.`, run);
    } else {
      run();
    }
  };

  const handleLeave = () => {
    confirm('Leave competition?', 'Your spot will be freed for another player.', () =>
      leave.mutate(undefined, { onError: (e) => Alert.alert('Could not leave', apiErrorMessage(e)) }),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.muted}>Loading competition…</Text>
          </View>
        )}
        {isError && !isLoading && (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Couldn't load this competition</Text>
            <Text style={styles.muted}>{apiErrorMessage(error)}</Text>
            <TouchableOpacity style={styles.retry} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {data && (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
              }
            >
              <StatusBanner competition={data} />
              <CompetitionHeader competition={data} />
              <SpotsProgress competition={data} />
              <DateTimeline competition={data} />
              <PrizeCard competition={data} />
              {data.viewer.canJoin && (
                <View style={styles.teamCard}>
                  <Text style={styles.teamLabel}>Team name (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Weekend Warriors"
                    value={teamName}
                    onChangeText={setTeamName}
                    maxLength={40}
                  />
                </View>
              )}
              <AboutCard competition={data} />
              <ParticipantsPreview slug={data.slug} total={data.participantCount} userId={userId} />
              <Text style={styles.debug}>
                status={data.status} • spotsLeft={data.spotsLeft} • registered=
                {String(data.viewer.isRegistered)}
              </Text>
            </ScrollView>
            <StickyActionBar
              competition={data}
              joining={join.isPending}
              leaving={leave.isPending}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  muted: { color: theme.colors.muted, fontSize: 13, textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  retry: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '800' },
  teamCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  teamLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  debug: { fontSize: 11, color: theme.colors.muted, textAlign: 'center', marginTop: 4 },
});
