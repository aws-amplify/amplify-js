import { globalExists, keyPrefixMatch, windowExists } from './helpers';

export function nextWebDetect() {
	return windowExists() && window['next'] && typeof window['next'] === 'object';
}

export function nextSSRDetect() {
	return (
		globalExists() &&
		(keyPrefixMatch(global, '__next') || keyPrefixMatch(global, '__NEXT'))
	);
}
