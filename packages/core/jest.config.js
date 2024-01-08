module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 74, // todo(ashwinkumar6): bump back to 75
			functions: 72,
			lines: 88,
			statements: 88,
		},
	},
	moduleNameMapper: {
		uuid: require.resolve('uuid'),
	},
};
