import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ObjectiveScreen } from './screens/ObjectiveScreen';
import { useAppFonts } from './components/Tx';

const queryClient = new QueryClient();

const SLUG = process.env.EXPO_PUBLIC_COMPETITION_SLUG ?? 'feedants-classical-dance';
const USER = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? '';

function Root() {
  useAppFonts();
  return <ObjectiveScreen slug={SLUG} userId={USER.trim() || null} />;
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
