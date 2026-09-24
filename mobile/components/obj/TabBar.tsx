import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { House, Plus, Search, Trophy } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { Img } from './Img';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';

const PROFILE_AVATAR = 'https://picsum.photos/seed/feedants-profile/120/120';

function Slot({
  label,
  active,
  children,
  onPress,
}: {
  label: string | null;
  active?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: px(3) }}>
      {children}
      {!!label && (
        <Tx w={active ? 500 : 400} size={px(13)} color={active ? C.teal700 : C.inkTeal500}>
          {label}
        </Tx>
      )}
    </TouchableOpacity>
  );
}

export function TabBar() {
  const lang = useLang();
  const t = getStrings(lang);
  const icon = px(30);
  return (
    <View
      style={{
        height: px(65),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: C.borderCard,
        flexDirection: 'row',
        alignItems: 'stretch',
        shadowColor: '#103C40',
        shadowOpacity: 0.08,
        shadowRadius: px(8),
        shadowOffset: { width: 0, height: px(-2) },
        elevation: 8,
      }}
    >
      <Slot label={t.navHome}>
        <House size={icon} color={C.inkTeal500} strokeWidth={1.75} />
      </Slot>
      <Slot label={t.navExplore}>
        <Search size={icon} color={C.inkTeal500} strokeWidth={2} />
      </Slot>
      <Slot label={null}>
        <View
          style={{
            width: px(70),
            height: px(54),
            borderRadius: px(14),
            backgroundColor: C.teal700,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: px(-8),
          }}
        >
          <View
            style={{
              width: px(40),
              height: px(40),
              borderRadius: px(20),
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={px(22)} color={C.teal700} strokeWidth={2.5} />
          </View>
        </View>
      </Slot>
      <Slot label={t.navCompetitions} active>
        <Trophy size={icon} color={C.teal700} fill={C.teal700} strokeWidth={1.5} />
      </Slot>
      <Slot label={t.navProfile}>
        <Img uri={PROFILE_AVATAR} size={px(40)} radius={px(20)} label="P" />
      </Slot>
    </View>
  );
}
