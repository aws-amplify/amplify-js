import { globalExists, windowExists } from './helpers';

export function nuxtWebDetect() {
	return (
		windowExists() &&
		(window['__NUXT__'] !== undefined || window['$nuxt'] !== undefined)
	);
}

export function nuxtSSRDetect() {
	return (
		globalExists() && global['__VUE_SSR_CONTEXT__']?.['nuxt'] !== undefined
	);
}
