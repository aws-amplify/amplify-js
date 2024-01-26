// Suppress console messages printing during unit tests.
// Comment out log level as necessary (e.g. while debugging tests)
global.console = {
	...console,
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};

// React Native global
global['__DEV__'] = true;
