import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
import IndexedDBSafariAdapter from '../IndexedDBSafariAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';

function isSafari() {
	return (navigator.vendor.match(/apple/i) || '').length > 0;
}

const getDefaultAdapter: () => Adapter = () => {
	const { isBrowser } = browserOrNode();

	if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
		if (isSafari()) {
			return IndexedDBSafariAdapter;
		}

		return IndexedDBAdapter;
	}

	return AsyncStorageAdapter;
};

export default getDefaultAdapter;
