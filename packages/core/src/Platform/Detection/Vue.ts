import { globalExists, windowExists } from './helpers';

export function vueWebDetect() {
	return windowExists() && window['__VUE__'] !== undefined;
}
export function vueSSRDetect() {
	return globalExists() && global['__VUE_SSR_CONTEXT__'] !== undefined;
}
