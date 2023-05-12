module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	testMatch: ['**/__tests__/**/*.+(test|spec).[jt]s', '!**/*.native.*'],
	// TODO: remove this after bumping to Jest 28+
	moduleNameMapper: {
		'^@aws-amplify/core/internal-pinpoint-client$':
			'@aws-amplify/core/lib-esm/AWSClients/Pinpoint',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		url: 'http://localhost/',
	},
	collectCoverageFrom: ['**/src/**', '!**/src/**/*.native.*'],
	coverageThreshold: {
		global: {
			statements: 90,
			branches: 80,
			lines: 90,
			functions: 90,
		},
	},
	coveragePathIgnorePatterns: ['/node_modules/', 'dist', 'lib', 'lib-esm'],
};
