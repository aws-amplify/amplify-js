import { AsyncStorage } from 'react-native';

// See: https://reactnative.dev/docs/asyncstorage
export class InMemoryStore {
	getItem = AsyncStorage.getItem;
	setItem = AsyncStorage.setItem;
	removeItem = AsyncStorage.removeItem;
	// We don't use `mergeItem()`
	// We don't use `clear()`
	getAllKeys = AsyncStorage.getAllKeys;
	// We don't use `flushGetRequests()`
	multiGet = AsyncStorage.multiGet;
	multiSet = AsyncStorage.multiSet;
	multiRemove = AsyncStorage.multiRemove;
	// We don't use `multiMerge()`
}
