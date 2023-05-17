import { documentExists, processExists, windowExists } from './helpers';

export function reactWebDetect() {
	return documentExists() && !!document.getElementById('react-root');
}

export function reactSSRDetect() {
	return (
		processExists() &&
		typeof process.env !== 'undefined' &&
		!!Object.keys(process.env).find(key => key.includes('react'))
	);
}
