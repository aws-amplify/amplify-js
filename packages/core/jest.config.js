module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 72,
			lines: 88,
			statements: 88,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
