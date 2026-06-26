module.exports = {
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: {
					allowJs: true,
					esModuleInterop: true,
					types: ['jest', 'node'],
					noEmitOnError: false,
				},
			},
		],
	},
	testMatch: ['**/__tests__/**/*.+(test|spec).[jt]s', '!**/*.native.*'],
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
