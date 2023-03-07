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
		global: {
			statements: 80,
			branches: 80,
			lines: 80,
			functions: 80,
		},
	},
	coveragePathIgnorePatterns: ['/node_modules/', 'dist', 'lib', 'lib-esm'],
};
