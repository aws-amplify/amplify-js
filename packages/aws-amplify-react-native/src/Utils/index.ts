import { Platform } from 'react-native';

export const setTestId = (id: string) => {
	return Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id };
};
