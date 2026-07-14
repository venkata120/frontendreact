import { Alert, Linking } from 'react-native';

export const confirmAction = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Yes',
  cancelText = 'Cancel'
) => {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ],
    { cancelable: true }
  );
};

export const callPhone = async (phoneNumber?: string | null) => {
  if (!phoneNumber) {
    Alert.alert('No phone number', 'Phone number is not available.');
    return;
  }
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned) {
    Alert.alert('No phone number', 'Phone number is not available.');
    return;
  }
  const url = `tel:${cleaned}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Some devices report false even though the dialer works; try opening anyway.
      await Linking.openURL(url);
    }
  } catch (err: any) {
    Alert.alert('Unable to call', err?.message || 'No calling app is available on this device.');
  }
};
