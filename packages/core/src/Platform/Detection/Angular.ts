import { processExists, windowExists } from './helpers';

export function angularWebDetect() {
	return windowExists() && typeof window['ng'] !== 'undefined';
}

export function angularSSRDetect() {
	return (
		(processExists() &&
			typeof process.env === 'object' &&
			process.env['npm_lifecycle_script']?.startsWith('ng ')) ||
		false
	);
}
