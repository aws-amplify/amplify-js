module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 86,
			functions: 95,
			lines: 89,
			statements: 89,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
