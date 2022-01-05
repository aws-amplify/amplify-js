import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';

const getDefaultAdapter: () => Adapter = () => {
	const { isBrowser } = browserOrNode();

	// if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
	// 	return IndexedDBAdapter;
	// }

	return AsyncStorageAdapter;
};

export default getDefaultAdapter;
