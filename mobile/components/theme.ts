/** Design tokens measured from the Objective reference (852px canvas). */

export const C = {
  bgPage: '#F5F8F8',
  surface: '#FFFFFF',
  borderCard: '#E6EEEE',
  chipGrey: '#EDF1F1',
  rowTint: '#F0F6F6',

  teal900: '#0A4F55',
  teal700: '#0B6467',
  teal600: '#0E7377',
  teal200: '#B7D9DA',
  teal100: '#E2EFF0',

  mint100: '#E2F5EC',
  mint200: '#CFE8E0',

  ink900: '#10272C',
  ink700: '#2B3F44',
  ink600: '#52676C',
  inkTeal500: '#5E8388',

  gold: '#F2A81D',
  silver: '#AEB6BB',
  bronze: '#EE7B22',
  ribbonGreen: '#2E9E6B',

  razorpayBlue: '#3395FF',
  razorpayNavy: '#0B2A5B',

  gridBorder: '#D2E3E3',
  gridDivider: '#D9E6E6',
  tabBaseline: '#DCE6E6',
  toggleTrack: '#E9EEEE',
  adBorder: '#C9D6D6',
  adText: '#5F7275',
  adIcon: '#7A8B8E',
} as const;

export const STATUS_META: Record<string, { label: string }> = {
  registration_open: { label: 'Registration Open' },
  full: { label: 'Full' },
  registration_closed: { label: 'Registration Closed' },
  live: { label: 'Live Now' },
  completed: { label: 'Completed' },
  cancelled: { label: 'Cancelled' },
  upcoming: { label: 'Coming Soon' },
};
