import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
import IndexedDBSafariAdapter from '../IndexedDBSafariAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';

function isSafari() {
	const chromeAgent = navigator.userAgent.indexOf('Chrome') > -1;
	const safariAgent = navigator.userAgent.indexOf('Safari') > -1;

	// if both are true => we're running in Chrome
	if (chromeAgent && safariAgent) return false;

	return safariAgent;
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
