module.exports = {
	...require('../../jest.config'),
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*.test.{ts,tsx}',
		'!src/**/*.spec.{ts,tsx}',
		'!src/**/index.ts', // Re-export files
		'!src/types/**/*', // Type definition files
	],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/dist/',
		'/coverage/',
		'/__tests__/',
		'/android/',
		'/ios/',
		'\\.d\\.ts$',
		'index\\.ts$',
		'/types/',
	],
	coverageThreshold: {
		global: {
			branches: 25,
			functions: 25,
			lines: 35,
			statements: 35,
		},
	},
};
