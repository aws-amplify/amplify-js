import { globalExists, keyPrefixMatch } from './helpers';

export function nextWebDetect() {
	return window && window['next'] && typeof window['next'] === 'object';
}

export function nextSSRDetect() {
	return (
		globalExists() &&
		(keyPrefixMatch(global, '__next') || keyPrefixMatch(global, '__NEXT'))
	);
}
