import React from 'react';
import { View } from 'react-native';
import { Check, Trophy, Users } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { cardStyle } from './Img';
import { getStrings, useLang } from '../../i18n';
import { formatMoney } from '../../hooks/useCountdown';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

function Chip({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: C.chipGrey,
        borderRadius: px(8),
        paddingHorizontal: px(13),
        paddingVertical: px(6),
      }}
    >
      <Tx size={px(15)} color={C.ink700}>
        {label}
      </Tx>
    </View>
  );
}

export function SummaryCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const capacity = c.capacity ?? c.maxParticipants;
  const booked = c.booked ?? c.participantCount;
  const trackW = px(253);
  const fillW = Math.max((booked / Math.max(1, capacity)) * trackW, px(32));

  return (
    <View style={[cardStyle(26), { paddingTop: px(16), paddingBottom: px(20) }]}>
      {/* Row A — title + status badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tx w={700} size={px(26)} color={C.ink900} numberOfLines={1} style={{ flex: 1, marginRight: px(12) }}>
          {c.title}
        </Tx>
        {c.viewer.isRegistered && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: C.teal100,
              borderWidth: 1,
              borderColor: C.teal200,
              borderRadius: px(10),
              paddingHorizontal: px(14),
              paddingVertical: px(7),
              gap: px(10),
            }}
          >
            <View
              style={{
                width: px(22),
                height: px(22),
                borderRadius: px(11),
                backgroundColor: C.teal700,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={px(14)} color="#fff" strokeWidth={3} />
            </View>
            <Tx w={500} size={px(15)} color={C.teal700}>
              {t.registered}
            </Tx>
          </View>
        )}
      </View>

      {/* Row B — tags + certificate note */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: px(8), gap: px(14) }}>
        {c.tags.slice(0, 2).map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(13) }}>
          <Trophy size={px(26)} color={C.teal700} strokeWidth={1.75} />
          {c.certificateForWinners && (
            <Tx w={500} size={px(15)} color={C.teal600}>
              {t.winnersCertificate}
            </Tx>
          )}
        </View>
      </View>

      {/* Row C — stats */}
      <View style={{ flexDirection: 'row', marginTop: px(18) }}>
        <View style={{ width: px(227) }}>
          <Tx size={px(15)} color={C.ink600}>
            {t.prizePool}
          </Tx>
          <Tx w={700} size={px(36)} color={C.teal900} style={{ marginTop: px(2) }}>
            {formatMoney(c.prizePool)}
          </Tx>
        </View>
        <View style={{ width: px(240) }}>
          <Tx size={px(15)} color={C.ink600}>
            {t.entryFee}
          </Tx>
          <Tx w={700} size={px(30)} color={C.teal900} style={{ marginTop: px(2) }}>
            {c.entryFee === 0 ? t.freeEntry : formatMoney(c.entryFee)}
          </Tx>
        </View>
        <View style={{ width: px(253) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(10) }}>
            <Users size={px(20)} color={C.teal700} strokeWidth={1.75} />
            <Tx w={500} size={px(16)} color={C.teal900} numberOfLines={1}>
              {c.spotsLeft > 0 ? t.spotsLeft(c.spotsLeft) : t.soldOut}
            </Tx>
          </View>
          <View
            style={{
              width: trackW,
              height: px(5),
              borderRadius: px(999),
              backgroundColor: C.teal100,
              marginTop: px(12),
              overflow: 'hidden',
            }}
          >
            <View style={{ width: fillW, height: px(5), backgroundColor: C.teal700 }} />
          </View>
          <Tx size={px(15)} color={C.ink600} style={{ marginTop: px(8) }}>
            {t.booked(booked, capacity)}
          </Tx>
        </View>
      </View>
    </View>
  );
}
