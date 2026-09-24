import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { formatMoney } from '../../hooks/useCountdown';
import type { CompetitionDetails } from '../../api/client';
import { getStrings, useLang } from '../../i18n';
import { px } from '../../utils/scale';
import { confirmAction } from '../../utils/platform';

export function StickyCTA({
  c,
  joining,
  leaving,
  onJoin,
  onUpload,
  onLeave,
}: {
  c: CompetitionDetails;
  joining: boolean;
  leaving: boolean;
  onJoin: () => void;
  onUpload: () => void;
  onLeave: () => void;
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
        disabled={!enabled || joining || leaving}
        onPress={() => {
          if (registered) {
            onUpload();
            return;
          }
          confirmAction(t.registerNow, sub, () => onJoin());
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
        {joining || leaving ? (
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
      {c.viewer.canLeave && (
        <TouchableOpacity
          disabled={leaving}
          onPress={() =>
            confirmAction(t.leaveConfirmTitle, t.leaveConfirmBody, () => onLeave())
          }
          style={{ alignSelf: 'center', marginTop: px(8), paddingVertical: px(4), paddingHorizontal: px(12) }}
        >
          <Tx size={px(13)} color={C.teal700} w={600}>
            {leaving ? t.leaving : t.leaveComp}
          </Tx>
        </TouchableOpacity>
      )}
    </View>
  );
}
