module.exports = {
	testPathIgnorePatterns: [
		'__tests__/utils/*',
		'__tests__/providers/cognito/testUtils/*',
		// TODO: make sure hosted-ui test on v6 don't have this same issue
		'__tests__/hosted-ui',
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	clearMocks: true,
	collectCoverage: true,
	globals: {
		'ts-jest': {
			diagnostics: false,
			tsConfig: {
				allowJs: true,
				noEmitOnError: false,
			},
		},
	},
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
	testEnvironment: 'jsdom',
	coveragePathIgnorePatterns: [
		'node_modules',
	]
};
