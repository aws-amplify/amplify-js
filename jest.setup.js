// Suppress console messages printing during unit tests.
// Comment out log level as necessary (e.g. while debugging tests)
const noop = () => undefined;

global.console = {
	...console,
	log: noop,
	debug: noop,
	info: noop,
	warn: noop,
	error: noop,
};

// React Native global
global['__DEV__'] = true;
