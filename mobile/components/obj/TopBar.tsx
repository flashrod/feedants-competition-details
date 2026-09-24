import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';

export function TopBar({ onLang }: { onLang: (l: 'en' | 'hi') => void }) {
  const lang = useLang();
  const t = getStrings(lang);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: px(40),
        paddingTop: px(5),
        paddingBottom: px(9),
        backgroundColor: C.bgPage,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: px(19) }}
        onPress={() => Alert.alert(t.goBack, t.backSoon)}
        accessibilityLabel={t.goBack}
      >
        <ArrowLeft size={px(24)} color={C.ink900} strokeWidth={2.5} />
        <Tx w={500} size={px(20)} color={C.ink900}>
          {t.goBack}
        </Tx>
      </TouchableOpacity>
      <LangToggle onChange={onLang} />
    </View>
  );
}

export function LangToggle({ onChange }: { onChange?: (l: 'en' | 'hi') => void }) {
  const lang = useLang();
  const seg = (l: 'en' | 'hi', label: string) => {
    const active = lang === l;
    return (
      <TouchableOpacity
        key={l}
        onPress={() => onChange?.(l)}
        style={{
          flex: 1,
          height: px(36),
          borderRadius: px(999),
          backgroundColor: active ? C.teal700 : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Tx w={active ? 700 : 500} size={px(16)} color={active ? '#fff' : C.ink900}>
          {label}
        </Tx>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        width: px(135),
        height: px(36),
        borderRadius: px(999),
        backgroundColor: C.toggleTrack,
        flexDirection: 'row',
      }}
    >
      {seg('en', 'ENG')}
      {seg('hi', 'हिंदी')}
    </View>
  );
}
