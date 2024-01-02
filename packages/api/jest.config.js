module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
