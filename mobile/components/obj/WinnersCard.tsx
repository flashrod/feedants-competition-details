import React from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { PlayGlyph, cardStyle } from './Img';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

export function WinnersCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const winners = c.previousWinners ?? [];
  if (winners.length === 0) return null;
  return (
    <View style={[cardStyle(0), { paddingTop: px(17), paddingBottom: px(12) }]}>
      <Tx w={700} size={px(16)} color={C.ink900} style={{ paddingHorizontal: px(24) }}>
        {t.previousWinners}
      </Tx>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: px(18), marginTop: px(6), gap: px(14) }}
      >
        {winners.map((w) => (
          <TouchableOpacity
            key={w.name}
            onPress={() => Alert.alert(w.name, t.videoSoon)}
            style={{
              width: px(187),
              height: px(94),
              borderRadius: px(12),
              backgroundColor: C.chipGrey,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <View>
              {w.thumbUrl ? (
                <Image
                  source={{ uri: w.thumbUrl }}
                  style={{
                    width: px(92),
                    height: px(92),
                    borderTopLeftRadius: px(12),
                    borderBottomLeftRadius: px(12),
                  }}
                />
              ) : (
                <View style={{ width: px(92), height: px(92), backgroundColor: C.teal100 }} />
              )}
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: px(9),
                  width: px(28),
                  height: px(28),
                  borderRadius: px(14),
                  backgroundColor: C.teal700,
                  borderWidth: px(2),
                  borderColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlayGlyph size={px(6)} color="#fff" />
              </View>
            </View>
            <View style={{ marginLeft: px(15), flex: 1, paddingRight: px(8) }}>
              <Tx w={500} size={px(14)} color={C.ink900} numberOfLines={1}>
                {w.name}
              </Tx>
              <Tx size={px(13)} color={C.teal600} numberOfLines={1} style={{ marginTop: px(4) }}>
                {w.rankLabel}
              </Tx>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
