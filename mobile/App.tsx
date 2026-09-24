import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ObjectiveScreen } from './screens/ObjectiveScreen';
import { useAppFonts } from './components/Tx';

const queryClient = new QueryClient();

const DEFAULT_SLUG = 'feedants-classical-dance';

// Competition + demo user come from env; on web they can be overridden by URL
// query params (?slug=&userId=) so one build reaches every seeded competition,
// the same deep-linking shape a production app would use for shareable links.
function resolveRoute() {
  const envSlug = process.env.EXPO_PUBLIC_COMPETITION_SLUG ?? DEFAULT_SLUG;
  const envUser = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? '';
  if (typeof window === 'undefined') return { slug: envSlug, userId: envUser };
  const p = new URLSearchParams(window.location.search);
  return {
    slug: p.get('slug') ?? envSlug,
    userId: p.get('userId') ?? envUser,
  };
}

function Root() {
  const { slug, userId } = resolveRoute();
  useAppFonts();
  return <ObjectiveScreen slug={slug} userId={userId.trim() || null} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Root />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
