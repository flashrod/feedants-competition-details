import React from 'react';
import { View } from 'react-native';
import { Info, Medal, Star, Trophy } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { cardStyle } from './Img';
import { formatMoney } from '../../hooks/useCountdown';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

function RewardIcon({ icon }: { icon: 'gold' | 'silver' | 'bronze' | 'star' }) {
  const size = px(24);
  if (icon === 'gold') return <Trophy size={size} color={C.gold} fill={C.gold} strokeWidth={1.5} />;
  if (icon === 'silver') return <Medal size={size} color={C.silver} fill={C.silver} strokeWidth={1.5} />;
  if (icon === 'bronze') return <Medal size={size} color={C.bronze} fill={C.bronze} strokeWidth={1.5} />;
  return <Star size={size} color={C.teal700} strokeWidth={2} />;
}

export function RewardsCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const rewards = c.rewards ?? [];
  if (rewards.length === 0) return null;
  return (
    <View style={[cardStyle(24), { paddingTop: px(21), paddingBottom: px(12) }]}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: px(8) }}>
        <Tx w={700} size={px(16)} color={C.ink900}>
          {t.rewards}
        </Tx>
        <Tx size={px(15)} color={C.ink600}>
          {t.allPositions}
        </Tx>
      </View>
      <View style={{ marginTop: px(10), marginHorizontal: px(6), gap: px(3) }}>
        {rewards.map((r) => (
          <View
            key={r.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: C.rowTint,
              borderRadius: px(6),
              height: px(32),
              paddingLeft: px(1),
              paddingRight: px(18),
            }}
          >
            <RewardIcon icon={r.icon} />
            <Tx w={700} size={px(16)} color={C.ink900} style={{ flex: 1, marginLeft: px(28) }}>
              {r.label}
            </Tx>
            <Tx w={700} size={px(20)} color={C.teal900}>
              {formatMoney(r.amount)}
            </Tx>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DisclaimerStrip() {
  const lang = useLang();
  const t = getStrings(lang);
  return (
    <View
      style={{
        height: px(34),
        borderRadius: px(8),
        backgroundColor: C.teal100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: px(21),
      }}
    >
      <InfoDot />
      <Tx size={px(13)} color={C.ink600} numberOfLines={1} style={{ marginLeft: px(18), flex: 1 }}>
        <Tx w={700} size={px(13)} color={C.teal700}>
          {t.disclaimerTitle}
        </Tx>
        {t.disclaimerBody}
      </Tx>
    </View>
  );
}

function InfoDot() {
  return <Info size={px(22)} color={C.teal700} strokeWidth={1.75} />;
}
