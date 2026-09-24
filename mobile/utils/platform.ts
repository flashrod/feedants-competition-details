import { Alert } from 'react-native';

// React Native's Alert is a no-op on react-native-web, so the join confirmation
// (and inline errors) fall back to the browser's native dialogs there. The
// native path keeps the in-app Alert buttons.
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    else onCancel?.();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: onConfirm },
  ]);
}

export function notify(title: string, message?: string) {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}