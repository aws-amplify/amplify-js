module.exports = {
	...require('../../jest.config'),
	modulePathIgnorePatterns: [
		'<rootDir>/src/vendor/',
	],
	coverageThreshold: {
		global: {
			branches: 16,
			functions: 41,
			lines: 28,
			statements: 28,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
