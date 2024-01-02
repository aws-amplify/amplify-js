module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 61,
			functions: 71,
			lines: 75,
			statements: 76,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
