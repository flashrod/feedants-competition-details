import React, { useState } from 'react';
import { Share, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Check, Megaphone } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

export function ReferCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const [copied, setCopied] = useState(false);
  const ref = c.referral;
  if (!ref) return null;

  const onCopy = async () => {
    await Clipboard.setStringAsync(ref.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const onRefer = () => {
    Share.share({ message: `${t.shareTitle}: ${ref.link}` });
  };

  return (
    <View
      style={{
        backgroundColor: C.mint100,
        borderRadius: px(14),
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: px(24),
        paddingRight: px(69),
        paddingVertical: px(11),
      }}
    >
      <Megaphone size={px(49)} color={C.teal700} fill={C.teal700} strokeWidth={1} />
      <View style={{ marginLeft: px(30) }}>
        <Tx w={700} size={px(16)} color={C.ink900}>
          {t.referTitle}
        </Tx>
        <View style={{ flexDirection: 'row', marginTop: px(4) }}>
          <View
            style={{
              width: px(282),
              height: px(35),
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#D5E3E0',
              borderRadius: px(6),
              justifyContent: 'center',
              paddingHorizontal: px(12),
            }}
          >
            <Tx size={px(14)} color={C.teal700} numberOfLines={1}>
              {ref.link}
            </Tx>
          </View>
          <TouchableOpacity
            onPress={onCopy}
            style={{
              width: px(86),
              height: px(35),
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: C.teal700,
              borderRadius: px(6),
              marginLeft: px(3),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: px(3),
            }}
          >
            {copied && <Check size={px(12)} color={C.teal700} strokeWidth={3} />}
            <Tx w={700} size={px(13.5)} color={C.teal700} numberOfLines={1}>
              {copied ? t.copied : t.copyLink}
            </Tx>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginLeft: px(35) }}>
        <TouchableOpacity
          onPress={onRefer}
          style={{
            width: px(194),
            height: px(34),
            backgroundColor: C.teal700,
            borderRadius: px(5),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tx w={700} size={px(16)} color="#fff">
            {t.referNow}
          </Tx>
        </TouchableOpacity>
        <Tx size={px(13)} color={C.inkTeal500} style={{ marginTop: px(6) }} numberOfLines={1}>
          {t.earnCaption(`₹${ref.earnPerSignup}`).split(`₹${ref.earnPerSignup}`)[0]}
          <Tx w={700} size={px(13)} color={C.ink900}>
            ₹{ref.earnPerSignup}
          </Tx>
          {t.earnCaption(`₹${ref.earnPerSignup}`).split(`₹${ref.earnPerSignup}`)[1]}
        </Tx>
      </View>
    </View>
  );
}
