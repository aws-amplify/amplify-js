import { Platform } from 'react-native';

export const getIsPasskeySupported = () => {
	if (Platform.OS === 'android') {
		return Platform.Version > 28;
	}

	if (Platform.OS === 'ios') {
		return parseInt(Platform.Version, 10) >= 15;
	}

	return false;
};
