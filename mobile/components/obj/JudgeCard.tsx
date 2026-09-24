import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { Img, PlayGlyph, cardStyle } from './Img';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

export function JudgeCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const j = c.judge;
  if (!j) return null;
  return (
    <View
      style={[
        cardStyle(0),
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: px(35),
          paddingRight: px(85),
          paddingVertical: px(14),
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Img uri={j.photoUrl} size={px(100)} radius={px(50)} label={j.name} />
        <View style={{ marginLeft: px(31), paddingTop: px(7) }}>
          <Tx size={px(14)} color={C.inkTeal500}>
            {t.judge}
          </Tx>
          <Tx w={700} size={px(20)} color={C.ink900} style={{ marginTop: px(6) }}>
            {j.name}
          </Tx>
          {!!j.title && (
            <Tx size={px(14)} color={C.inkTeal500} style={{ marginTop: px(8) }}>
              {j.title}
            </Tx>
          )}
          {!!j.experience && (
            <Tx size={px(14)} color={C.inkTeal500} style={{ marginTop: px(4) }}>
              {j.experience}
            </Tx>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => Alert.alert(t.introVideo, t.videoSoon)}
          style={{
            width: px(58),
            height: px(58),
            borderRadius: px(29),
            backgroundColor: C.teal100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlayGlyph size={px(11)} color={C.teal700} />
        </TouchableOpacity>
        <Tx size={px(14)} color={C.inkTeal500} style={{ marginTop: px(6) }}>
          {t.introVideo}
        </Tx>
      </View>
    </View>
  );
}
