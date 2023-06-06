import { MMKV } from 'react-native-mmkv';

const Storage = new MMKV();

// See: https://react-native-async-storage.github.io/async-storage/
export function createInMemoryStore() {
	return Storage;
}
