import React from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import { useLang } from '../i18n';

export type FontWeight = 400 | 500 | 600 | 700;

const INTER: Record<FontWeight, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
};

const DEVANAGARI: Record<FontWeight, string> = {
  400: 'NotoSansDevanagari_400Regular',
  500: 'NotoSansDevanagari_500Medium',
  600: 'NotoSansDevanagari_600SemiBold',
  700: 'NotoSansDevanagari_700Bold',
};

export function useAppFonts() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
    NotoSansDevanagari_700Bold,
  });
  return loaded;
}

export function Tx({
  w = 400,
  size,
  color,
  style,
  children,
  ...rest
}: {
  w?: FontWeight;
  size: number;
  color: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof RNText>, 'style'>) {
  const lang = useLang();
  const family = (lang === 'hi' ? DEVANAGARI : INTER)[w];
  return (
    <RNText style={[{ fontFamily: family, fontSize: size, color }, style]} {...rest}>
      {children}
    </RNText>
  );
}
