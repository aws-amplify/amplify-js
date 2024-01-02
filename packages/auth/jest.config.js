module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 64,
			functions: 74,
			lines: 83,
			statements: 83,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
