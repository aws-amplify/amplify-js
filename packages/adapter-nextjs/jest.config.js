module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 88,
			functions: 90,
			lines: 92,
			statements: 93,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
