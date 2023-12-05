module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 64,
			functions: 86,
			lines: 89,
			statements: 89,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
