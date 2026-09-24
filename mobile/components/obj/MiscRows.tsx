import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Megaphone, MessageCircleMore } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { cardStyle } from './Img';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';

export function TestimonialsRow() {
  const lang = useLang();
  const t = getStrings(lang);
  return (
    <TouchableOpacity
      onPress={() => Alert.alert(t.hearTitle, t.testimonialsSoon)}
      style={[
        cardStyle(18),
        { height: px(52), flexDirection: 'row', alignItems: 'center' },
      ]}
    >
      <MessageCircleMore size={px(26)} color={C.ink900} strokeWidth={1.75} />
      <View style={{ flex: 1, marginLeft: px(17) }}>
        <Tx w={700} size={px(15)} color={C.ink900}>
          {t.hearTitle}
        </Tx>
        <Tx size={px(12)} color={C.inkTeal500} style={{ marginTop: px(1) }}>
          {t.hearSub}
        </Tx>
      </View>
      <ChevronRight size={px(22)} color={C.ink900} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export function AdSlot() {
  const lang = useLang();
  const t = getStrings(lang);
  return (
    <View
      style={{
        height: px(40),
        borderRadius: px(8),
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: C.adBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: px(20),
      }}
    >
      <Megaphone size={px(22)} color={C.adIcon} strokeWidth={1.75} />
      <Tx w={600} size={px(14)} color={C.adText}>
        {t.adHere}
      </Tx>
    </View>
  );
}
