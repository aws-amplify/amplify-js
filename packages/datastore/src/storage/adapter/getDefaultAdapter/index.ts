import { JS } from '@aws-amplify/core';
import { Adapter } from '..';

const getDefaultAdapter: () => Adapter = () => {
	const { isBrowser, isNode } = JS.browserOrNode();

	if (isNode) {
		require('fake-indexeddb/auto');
		return require('../indexeddb').default;
	}

	if (isBrowser && window.indexedDB) {
		return require('../indexeddb').default;
	}
};

export default getDefaultAdapter;
