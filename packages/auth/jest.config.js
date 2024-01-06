module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 69,
			functions: 78,
			lines: 87,
			statements: 86,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
