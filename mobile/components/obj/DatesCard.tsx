import React from 'react';
import { View } from 'react-native';
import { CalendarDays, Send, Trophy, Upload, type LucideIcon } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { cardStyle } from './Img';
import { formatSpecDate, formatSpecTime } from '../../hooks/useCountdown';
import { getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

function Cell({
  Icon,
  label,
  iso,
}: {
  Icon: LucideIcon;
  label: string;
  iso: string;
}) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={px(26)} color={C.teal700} strokeWidth={1.75} />
      <View style={{ marginLeft: px(26) }}>
        <Tx size={px(13)} color={C.inkTeal500}>
          {label}
        </Tx>
        <Tx w={700} size={px(17)} color={C.teal900} style={{ marginTop: px(6) }}>
          {formatSpecDate(iso)}
        </Tx>
        <Tx w={500} size={px(16)} color={C.ink700} style={{ marginTop: px(2) }}>
          {formatSpecTime(iso)}
        </Tx>
      </View>
    </View>
  );
}

export function DatesCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const m = c.milestones;
  if (!m) return null;
  return (
    <View style={[cardStyle(23), { paddingTop: px(21), paddingBottom: px(11) }]}>
      <Tx w={700} size={px(16)} color={C.ink900}>
        {t.importantDates}
      </Tx>
      <View
        style={{
          marginTop: px(4),
          marginHorizontal: px(-4),
          borderWidth: 1,
          borderColor: C.gridBorder,
          borderRadius: px(10),
          height: px(181),
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gridDivider }}>
          <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: C.gridDivider }}>
            <Cell Icon={CalendarDays} label={t.registerBefore} iso={m.registerBefore} />
          </View>
          <Cell Icon={Send} label={t.submissionStarts} iso={m.submissionStarts} />
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: C.gridDivider }}>
            <Cell Icon={Upload} label={t.submissionEnds} iso={m.submissionEnds} />
          </View>
          <Cell Icon={Trophy} label={t.resultDate} iso={m.result} />
        </View>
      </View>
    </View>
  );
}
