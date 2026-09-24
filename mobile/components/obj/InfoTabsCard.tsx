import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { cardStyle } from './Img';
import { ABOUT_HI, getStrings, useLang } from '../../i18n';
import type { CompetitionDetails } from '../../api/client';
import { px } from '../../utils/scale';

type Tab = 'about' | 'judging' | 'rules';

const JUDGING_HI = [
  'प्रदर्शन को तकनीक, भाव और मंच उपस्थिति पर आंका जाता है।',
  'निर्णय के लिए केवल सशुल्क प्रतिभागियों के योगदान पर विचार किया जाएगा।',
];
const RULES_HI = [
  'सभी आयु वर्गों के लिए खुला।',
  'प्रति प्रतिभागी एक सबमिशन।',
];

export function InfoTabsCard({ c }: { c: CompetitionDetails }) {
  const lang = useLang();
  const t = getStrings(lang);
  const [tab, setTab] = useState<Tab>('about');
  const [expanded, setExpanded] = useState(false);

  const tabs = c.aboutTabs;
  const linesFor = (id: Tab): string[] =>
    lang === 'hi' && id === 'about'
      ? ABOUT_HI
      : lang === 'hi' && id === 'judging'
        ? JUDGING_HI
        : lang === 'hi'
          ? RULES_HI
          : (tabs?.[id] ?? []);
  const activeLines = linesFor(tab);
  const visible = expanded ? activeLines : activeLines.slice(0, 3);
  const others: { id: Tab; label: string }[] = (
    [
      { id: 'judging', label: t.tabJudging },
      { id: 'rules', label: t.tabRules },
    ] as { id: Tab; label: string }[]
  ).filter((g) => g.id !== tab);

  const tabDef: { id: Tab; label: string }[] = [
    { id: 'about', label: t.tabAbout },
    { id: 'judging', label: t.tabJudging },
    { id: 'rules', label: t.tabRules },
  ];

  return (
    <View style={[cardStyle(23), { paddingTop: px(12), paddingBottom: px(6) }]}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.tabBaseline }}>
        {tabDef.map((d) => {
          const active = tab === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => {
                setTab(d.id);
                setExpanded(false);
              }}
              style={{
                width: px(206),
                alignItems: 'center',
                paddingVertical: px(8),
                borderBottomWidth: px(3),
                borderBottomColor: active ? C.teal700 : 'transparent',
                marginBottom: px(-1),
              }}
            >
              <Tx w={active ? 700 : 500} size={px(15)} color={active ? C.teal700 : C.teal600} numberOfLines={1}>
                {d.label}
              </Tx>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ marginTop: px(20) }}>
        {visible.map((line, i) => (
          <Tx key={i} size={px(15)} color={C.ink600} style={{ lineHeight: px(24.5), marginTop: i === 0 ? 0 : px(1) }}>
            {line}
          </Tx>
        ))}
        {expanded &&
          others.map((g) => (
            <View key={g.id} style={{ marginTop: px(12) }}>
              <Tx w={700} size={px(13)} color={C.teal700} style={{ marginBottom: px(4) }}>
                {g.label}
              </Tx>
              {linesFor(g.id).map((line, i) => (
                <Tx key={i} size={px(15)} color={C.ink600} style={{ lineHeight: px(24.5) }}>
                  {line}
                </Tx>
              ))}
            </View>
          ))}
      </View>
      {activeLines.length > 0 && (
        <TouchableOpacity
          onPress={() => setExpanded((e) => !e)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: px(8), gap: px(6) }}
        >
          <Tx w={500} size={px(15)} color={C.teal700}>
            {expanded ? t.viewLess : t.viewMore}
          </Tx>
          <ChevronDown
            size={px(14)}
            color={C.teal700}
            strokeWidth={2.5}
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
