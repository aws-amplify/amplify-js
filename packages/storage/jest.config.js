module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 80,
			lines: 81,
			statements: 91,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
