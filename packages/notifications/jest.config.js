module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	testMatch: ['**/__tests__/**/*.+(test|spec).[jt]s', '!**/*.native.*'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		url: 'http://localhost/',
	},
	collectCoverageFrom: ['**/src/**', '!**/src/**/*.native.*'],
	coverageThreshold: {
		// TODO(V6): revert these numbers back
		global: {
			statements: 0,
			branches: 0,
			lines: 0,
			functions: 0,
		},
	},
	coveragePathIgnorePatterns: ['/node_modules/', 'dist', 'lib', 'lib-esm'],
};
