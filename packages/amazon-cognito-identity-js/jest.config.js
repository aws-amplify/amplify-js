const { defaults } = require('jest-config');
module.exports = {
	testPathIgnorePatterns: [
		...defaults.testPathIgnorePatterns,
		'__tests__/util.js',
		'__tests__/constants.js',
		'__tests__/__mocks__/*',
	],
	collectCoverage: true,
	collectCoverageFrom: ['src/*.js'],

	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0,
		},
	},

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				diagnostics: false,
				tsconfig: {
					lib: [
						'es5',
						'es2015',
						'dom',
						'esnext.asynciterable',
						'es2017.object',
					],
					allowJs: true,
					esModuleInterop: true,
				},
			},
		],
	},
	preset: 'ts-jest',
	testRegex: ['(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],

	testEnvironment: 'jsdom',
};
