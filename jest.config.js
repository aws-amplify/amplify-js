/** @type {import('jest').Config} */
module.exports = {
	workerIdleMemoryLimit: '512MB',
	coveragePathIgnorePatterns: ['/node_modules/', 'dist', '__tests__'],
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
