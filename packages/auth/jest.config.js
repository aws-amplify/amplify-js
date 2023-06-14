
module.exports = {
	testPathIgnorePatterns: [
		'__tests__/utils/*',
		'__tests__/providers/cognito/testUtils/*',
		// TODO: make sure hosted-ui test on v6 don't have this same issue
	    '__tests__/hosted-ui'
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	clearMocks: true,
	collectCoverage: true,
	globals: {
		'ts-jest': {
			diagnostics: true,
			tsConfig: {
				lib: ['es5', 'es2015', 'dom', 'esnext.asynciterable', 'es2017.object'],
				allowJs: true,
				esModuleInterop: true,
			},
		},
	},
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
	},
	testRegex: ['(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$'],
	preset: 'ts-jest',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
	testEnvironment: 'jsdom'
};
