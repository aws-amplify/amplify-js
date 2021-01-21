import { Platform } from 'react-native';

export const setTestId = (id: string) => {
	return Platform.OS === 'android'
		? { accessible: true, accessibilityLabel: id }
		: { testID: id };
};
