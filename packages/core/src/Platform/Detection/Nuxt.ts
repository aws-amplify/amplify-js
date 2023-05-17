import { globalExists, windowExists } from './helpers';

export function nuxtWebDetect() {
	return (
		windowExists() &&
		(window['__NUXT__'] !== undefined || window['$nuxt'] !== undefined)
	);
}

export function nuxtSSRDetect() {
	return globalExists() && typeof global['__NUXT_PATHS__'] !== 'undefined';
}
