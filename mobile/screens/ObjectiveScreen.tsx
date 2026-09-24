import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../components/theme';
import { LangContext, getStrings } from '../i18n';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';
import { apiErrorMessage } from '../api/client';
import { TopBar } from '../components/obj/TopBar';
import { SummaryCard } from '../components/obj/SummaryCard';
import { JudgeCard } from '../components/obj/JudgeCard';
import { CountdownBanner } from '../components/obj/CountdownBanner';
import { DatesCard } from '../components/obj/DatesCard';
import { WinnersCard } from '../components/obj/WinnersCard';
import { InfoTabsCard } from '../components/obj/InfoTabsCard';
import { DisclaimerStrip, RewardsCard } from '../components/obj/RewardsCard';
import { TrustRow } from '../components/obj/TrustRow';
import { ReferCard } from '../components/obj/ReferCard';
import { AdSlot, TestimonialsRow } from '../components/obj/MiscRows';
import { StickyCTA } from '../components/obj/StickyCTA';
import { TabBar } from '../components/obj/TabBar';
import { Tx } from '../components/Tx';
import { px } from '../utils/scale';

export function ObjectiveScreen({ slug, userId }: { slug: string; userId: string | null }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = getStrings(lang);
  const { data, isLoading, isError, error, refetch, isRefetching, join } =
    useCompetitionDetails(slug, userId);

  return (
    <LangContext.Provider value={lang}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bgPage }} edges={['top', 'bottom']}>
        <TopBar onLang={setLang} />
        <View style={{ flex: 1 }}>
          {isLoading && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: px(8) }}>
              <ActivityIndicator size="large" color={C.teal700} />
            </View>
          )}
          {isError && !isLoading && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: px(24), gap: px(8) }}>
              <Tx w={700} size={px(16)} color={C.ink900}>
                {t.loadFail}
              </Tx>
              <Tx size={px(13)} color={C.ink600}>
                {apiErrorMessage(error)}
              </Tx>
              <TouchableOpacity
                onPress={() => refetch()}
                style={{ marginTop: px(8), backgroundColor: C.teal700, paddingHorizontal: px(22), paddingVertical: px(10), borderRadius: px(10) }}
              >
                <Tx w={700} size={px(14)} color="#fff">
                  {t.retry}
                </Tx>
              </TouchableOpacity>
            </View>
          )}
          {data && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: px(40), gap: px(12), paddingBottom: px(12) }}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={C.teal700} />}
            >
              <SummaryCard c={data} />
              <JudgeCard c={data} />
              <CountdownBanner c={data} />
              <DatesCard c={data} />
              <WinnersCard c={data} />
              <InfoTabsCard c={data} />
              <RewardsCard c={data} />
              <DisclaimerStrip />
              <TrustRow />
              <ReferCard c={data} />
              <TestimonialsRow />
              <AdSlot />
            </ScrollView>
          )}
        </View>
        {data && (
          <StickyCTA
            c={data}
            joining={join.isPending}
            onJoin={() =>
              join.mutate(
                {},
                { onError: (e) => Alert.alert(t.registerNow, apiErrorMessage(e)) },
              )
            }
            onUpload={() => Alert.alert(t.uploadSubmission, t.videoSoon)}
          />
        )}
        <TabBar />
      </SafeAreaView>
    </LangContext.Provider>
  );
}
