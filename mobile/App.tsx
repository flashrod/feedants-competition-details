import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CompetitionDetailsScreen } from './screens/CompetitionDetailsScreen';
import { theme } from './components/theme';

const queryClient = new QueryClient();

const PRESETS = [
  'weekend-mega-clash',
  'last-minute-sprint',
  'monday-night-live',
  'season-champions-2025',
];

const DEFAULT_SLUG = process.env.EXPO_PUBLIC_COMPETITION_SLUG ?? PRESETS[0];
const DEFAULT_USER = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? '';

export default function App() {
  const [slug, setSlug] = useState(DEFAULT_SLUG);
  const [draftSlug, setDraftSlug] = useState(DEFAULT_SLUG);
  const [userId, setUserId] = useState(DEFAULT_USER);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={styles.top} edges={['top']}>
          <Text style={styles.brand}>FEEDANTS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, slug === p && styles.chipActive]}
                onPress={() => {
                  setSlug(p);
                  setDraftSlug(p);
                }}
              >
                <Text style={[styles.chipText, slug === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.idRow}>
            <TextInput
              style={styles.idInput}
              value={draftSlug}
              onChangeText={setDraftSlug}
              placeholder="competition slug or id"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.go} onPress={() => setSlug(draftSlug.trim() || PRESETS[0])}>
              <Text style={styles.goText}>Open</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.idInputFull}
            value={userId}
            onChangeText={setUserId}
            placeholder="Demo user id (from backend seed) — enables Join/Leave"
            autoCapitalize="none"
          />
        </SafeAreaView>
        <CompetitionDetailsScreen key={slug + (userId || 'anon')} slug={slug} userId={userId.trim() || null} />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  top: { backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: 12, paddingBottom: 8 },
  brand: { fontWeight: '900', letterSpacing: 3, color: theme.colors.primaryDark, fontSize: 15, marginTop: 6 },
  presets: { marginTop: 8 },
  chip: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 12, color: theme.colors.text },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  idRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  idInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 8, fontSize: 12 },
  idInputFull: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 8, fontSize: 12, marginTop: 8 },
  go: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  goText: { color: '#fff', fontWeight: '800' },
});
