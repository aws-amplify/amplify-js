import { AsyncStorage } from 'react-native';

// See: https://reactnative.dev/docs/asyncstorage
export function createInMemoryStore() {
	return AsyncStorage;
}
