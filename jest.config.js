/** @type {import('jest').Config} */
module.exports = {
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'dist',
		'lib',
		'lib-esm',
		'__tests__',
	],
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
	setupFiles: ['../../jest.setup.js'],
	testEnvironment: 'jsdom',
	testRegex: '/__tests__/.*\\.(test|spec)\\.[jt]sx?$',
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: {
					allowJs: true,
					lib: ['dom', 'es2020'],
					noImplicitAny: false,
					types: ['jest', 'jsdom'],
				},
			},
		],
	},
};
