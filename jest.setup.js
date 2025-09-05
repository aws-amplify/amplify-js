// Suppress console messages printing during unit tests.
// Comment out log level as necessary (e.g. while debugging tests)
global.console = {
	...console,
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

// React Native global
global['__DEV__'] = true;

/* this is available according to
	https://developer.mozilla.org/en-US/docs/Web/API/URL

	for react-native use:
	import { loadUrlPolyfill } from '@aws-amplify/react-native';
 */
Object.defineProperty(URL, 'parse', {
	value: (path, origin) => {
		try {
			return new URL(path, origin);
		} catch {
			return null;
		}
	},
});

Object.defineProperty(URL, 'canParse', {
	value: (path, origin) => {
		const out = URL.parse(path, origin);
		return null !== out;
	},
});
