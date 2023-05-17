import { globalExists, keyPrefixMatch, windowExists } from './helpers';

export function vueWebDetect() {
	return windowExists() && keyPrefixMatch(window, '__VUE');
}
export function vueSSRDetect() {
	return globalExists() && keyPrefixMatch(global, '__VUE');
}
