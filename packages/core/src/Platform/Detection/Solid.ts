import { packageExists, windowExists } from './helpers';

export function solidWebDetect() {
	return windowExists() && window['Solid$$'] !== undefined;
}

export function solidSSRDetect() {
	return packageExists('solid-js');
}
