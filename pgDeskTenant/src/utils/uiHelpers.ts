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
  if (!phoneNumber) return;
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned) return;
  const url = `tel:${cleaned}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Unable to call', 'No calling app is available on this device.');
  }
};
