module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 65.5,
			lines: 90,
			statements: 91,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
