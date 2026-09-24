import { Dimensions } from 'react-native';

/**
 * Reference canvas is 852px wide. s = deviceWidth / 852; multiply every
 * spec value by s. (Spec section 0.)
 */
export const REF_W = 852;
export const s = Dimensions.get('window').width / REF_W;

/** Scale a reference-px value to device dp. */
export function px(n: number): number {
  return n * s;
}
