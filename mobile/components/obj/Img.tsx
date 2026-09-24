import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { C } from '../theme';
import { Tx } from '../Tx';
import { px } from '../../utils/scale';

/** Remote image with an initials tile fallback (offline / broken URL). */
export function Img({
  uri,
  size,
  radius,
  label,
  bg,
}: {
  uri: string | null | undefined;
  size: number;
  radius: number;
  label: string;
  bg?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg ?? C.teal100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Tx w={700} size={size * 0.38} color={C.teal700}>
          {(label.trim().slice(0, 1) || '?').toUpperCase()}
        </Tx>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      onError={() => setFailed(true)}
    />
  );
}

export function PlayGlyph({ size, color = '#fff' }: { size: number; color?: string }) {
  // Slightly right-offset filled triangle for optical centering.
  return (
    <View
      style={{
        width: 0,
        height: 0,
        marginLeft: size * 0.12,
        borderLeftWidth: size,
        borderTopWidth: size * 0.62,
        borderBottomWidth: size * 0.62,
        borderLeftColor: color,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      }}
    />
  );
}

export function cardStyle(padH = 24) {
  return {
    backgroundColor: C.surface,
    borderRadius: px(16),
    borderWidth: 1,
    borderColor: C.borderCard,
    shadowColor: '#103C40',
    shadowOpacity: 0.08,
    shadowRadius: px(10),
    shadowOffset: { width: 0, height: px(2) },
    elevation: 2,
    paddingHorizontal: px(padH),
  };
}
