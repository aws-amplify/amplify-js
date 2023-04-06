import { Framework } from './types';

export const detectFramework = () => {
	if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
		return Framework.ReactNative;
	}
	return Framework.None;
};
