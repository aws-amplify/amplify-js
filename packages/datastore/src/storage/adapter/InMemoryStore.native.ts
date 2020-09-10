import AsyncStorage from '@react-native-community/async-storage';

// See: https://reactnative.dev/docs/asyncstorage
export function createInMemoryStore() {
	return AsyncStorage;
}
