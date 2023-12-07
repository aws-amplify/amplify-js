module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 66,
			lines: 90,
			statements: 91,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
