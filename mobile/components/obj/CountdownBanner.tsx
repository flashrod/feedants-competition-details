import React from 'react';
import { View } from 'react-native';
import { Hourglass, Timer } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { formatCountdownFull, useCountdown } from '../../hooks/useCountdown';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

export function CountdownBanner({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const cd = useCountdown(c.registrationDeadline);
  return (
    <View
      style={{
        height: px(52),
        borderRadius: px(10),
        backgroundColor: C.teal100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: px(38),
        paddingRight: px(47),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(31) }}>
        <Hourglass size={px(24)} color={C.teal700} strokeWidth={1.75} />
        <Tx w={600} size={px(16)} color={C.ink900}>
          {cd ? t.regClosesIn : t.regClosed}
        </Tx>
      </View>
      {cd && (
        <Tx w={700} size={px(21)} color={C.teal600}>
          {formatCountdownFull(cd)}
        </Tx>
      )}
      {cd && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(11) }}>
          <Timer size={px(24)} color={C.teal700} strokeWidth={1.75} />
          <Tx w={500} size={px(16)} color={C.teal600}>
            {t.hurryUp}
          </Tx>
        </View>
      )}
    </View>
  );
}
