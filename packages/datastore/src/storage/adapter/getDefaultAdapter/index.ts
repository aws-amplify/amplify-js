import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';

/**
 * Explores the environment to determine which adapter should be used if the
 * app does not provide one.
 *
 * Apps can provide a preferred adapter with:
 *
 * ```
 * DataStore.configure({
 * 	storageAdapter: Adapter
 * });
 * ```
 */
const getDefaultAdapter: () => Adapter = () => {
	const { isBrowser } = browserOrNode();

	if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
		return IndexedDBAdapter;
	}

	return AsyncStorageAdapter;
};

export default getDefaultAdapter;
