module.exports = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	clearMocks: true,
	collectCoverage: true,
	globals: {
		'ts-jest': {
			diagnostics: false,
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
	preset: 'ts-jest',
	testRegex: ['(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],

	testEnvironment: 'jsdom',
};
