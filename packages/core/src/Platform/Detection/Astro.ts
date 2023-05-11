import { documentExists, globalExists } from './helpers';

export function astroWebDetect() {
	return (
		documentExists() &&
		typeof document.querySelectorAll === 'function' &&
		document.querySelectorAll('[class*="astro-"]').length > 0
	);
}

export function astroSSRDetect() {
	return globalExists() && global['@astrojs/compiler'] !== undefined;
}
