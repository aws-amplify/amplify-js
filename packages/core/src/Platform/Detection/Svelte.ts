import { keyPrefixMatch, packageExists, windowExists } from './helpers';

export function svelteWebDetect() {
	return windowExists() && keyPrefixMatch(window, '__SVELTE');
}

export function svelteSSRDetect() {
	return packageExists('svelte');
}
