module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 78,
			functions: 94,
			lines: 96,
			statements: 96,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
