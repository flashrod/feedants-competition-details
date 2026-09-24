export const theme = {
  colors: {
    primary: '#15803d',
    primaryDark: '#166534',
    background: '#f6f7f4',
    card: '#ffffff',
    text: '#101613',
    muted: '#5f6b61',
    border: '#e3e7e1',
    warning: '#b45309',
    danger: '#b91c1c',
    live: '#dc2626',
    gold: '#a16207',
  },
  radius: { sm: 8, md: 14, lg: 20 },
};

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  registration_open: { label: 'Registration Open', color: '#15803d', bg: '#dcfce7' },
  full: { label: 'Full', color: '#b45309', bg: '#fef3c7' },
  registration_closed: { label: 'Registration Closed', color: '#57534e', bg: '#e7e5e4' },
  live: { label: 'Live Now', color: '#ffffff', bg: '#dc2626' },
  completed: { label: 'Completed', color: '#57534e', bg: '#e7e5e4' },
  cancelled: { label: 'Cancelled', color: '#ffffff', bg: '#44403c' },
  upcoming: { label: 'Coming Soon', color: '#1d4ed8', bg: '#dbeafe' },
};
