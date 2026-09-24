import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { PlayGlyph, cardStyle } from './Img';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';

function RazorpayLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(5) }}>
      <View
        style={{
          width: px(16),
          height: px(16),
          backgroundColor: C.razorpayBlue,
          transform: [{ skewX: '-18deg' }],
          borderRadius: px(2),
        }}
      />
      <Tx
        w={700}
        size={px(17)}
        color={C.razorpayNavy}
        style={{ transform: [{ skewX: '-8deg' }] }}
      >
        Razorpay
      </Tx>
    </View>
  );
}

export function TrustRow() {
  const lang = useLang();
  const t = getStrings(lang);
  return (
    <View style={{ flexDirection: 'row', gap: px(20) }}>
      {/* Prize-money video card */}
      <TouchableOpacity
        onPress={() => Alert.alert(t.prizeVideoTitle, t.videoSoon)}
        style={[cardStyle(24), { width: px(315), paddingVertical: px(12), flexDirection: 'row', alignItems: 'center' }]}
      >
        <View
          style={{
            width: px(58),
            height: px(58),
            borderRadius: px(12),
            backgroundColor: C.mint200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: px(34),
              height: px(34),
              borderRadius: px(17),
              backgroundColor: C.teal700,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayGlyph size={px(7)} color="#fff" />
          </View>
        </View>
        <View style={{ marginLeft: px(20), flex: 1 }}>
          <Tx w={700} size={px(15)} color={C.ink900} style={{ lineHeight: px(20) }}>
            {t.prizeVideoTitle}
          </Tx>
          <Tx size={px(13)} color={C.inkTeal500} style={{ marginTop: px(4) }}>
            {t.prizeVideoSub}
          </Tx>
        </View>
      </TouchableOpacity>

      {/* Policy / payments card */}
      <View style={[cardStyle(13), { width: px(437), paddingVertical: px(7), justifyContent: 'center' }]}>
        <TouchableOpacity
          onPress={() => Alert.alert(t.refundPolicy, t.policySoon)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: px(13) }}
        >
          <ShieldCheck size={px(26)} color={C.teal900} strokeWidth={1.75} />
          <Tx size={px(13.5)} color={C.ink700}>
            {t.refundPolicy}
          </Tx>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(13), marginTop: px(13) }}>
          <ShieldCheck size={px(26)} color={C.teal900} strokeWidth={1.75} />
          <Tx size={px(13.5)} color={C.ink700}>
            {t.securePayments}
          </Tx>
          <RazorpayLogo />
        </View>
      </View>
    </View>
  );
}
