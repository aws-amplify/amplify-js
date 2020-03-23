import { Adapter } from '..';

const getDefaultAdapter: () => Adapter = () => {
	if (window.indexedDB) {
		return require('../indexeddb').default;
	}
	if (process && process.env) {
		throw new Error('Node is not supported');
	}
};

export default getDefaultAdapter;
