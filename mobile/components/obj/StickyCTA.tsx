import React from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { formatMoney } from '../../hooks/useCountdown';
import type { CompetitionDetails } from '../../api/client';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';

export function StickyCTA({
  c,
  joining,
  onJoin,
  onUpload,
}: {
  c: CompetitionDetails;
  joining: boolean;
  onJoin: () => void;
  onUpload: () => void;
}) {
  const lang = useLang();
  const t = getStrings(lang);
  const registered = c.viewer.isRegistered;

  const main = registered ? t.uploadSubmission : c.viewer.canJoin ? t.registerNow : (c.viewer.joinDisabledReason ?? t.regClosed);
  const sub = registered
    ? t.registeredSub
    : c.viewer.canJoin
      ? c.entryFee === 0
        ? t.freeEntry
        : t.entryFeeSub(formatMoney(c.entryFee))
      : '';
  const enabled = registered || c.viewer.canJoin;

  return (
    <View style={{ paddingHorizontal: px(40), backgroundColor: C.bgPage, paddingBottom: px(9) }}>
      <TouchableOpacity
        disabled={!enabled || joining}
        onPress={() => {
          if (registered) {
            onUpload();
            return;
          }
          Alert.alert(t.registerNow, sub, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: t.registerNow,
              onPress: () => onJoin(),
            },
          ]);
        }}
        style={{
          height: px(54),
          borderRadius: px(8),
          backgroundColor: C.teal700,
          opacity: enabled ? 1 : 0.55,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0A4F55',
          shadowOpacity: 0.25,
          shadowRadius: px(8),
          shadowOffset: { width: 0, height: px(3) },
          elevation: 3,
        }}
      >
        {joining ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Tx w={700} size={px(18)} color="#fff">
              {main}
            </Tx>
            {!!sub && (
              <Tx size={px(14)} color="rgba(255,255,255,0.85)" style={{ marginTop: px(1) }}>
                {sub}
              </Tx>
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
