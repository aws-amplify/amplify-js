module.exports = {
	...require('../../jest.config'),
	testEnvironment: 'node',
	coverageThreshold: {
		global: {
			branches: 88,
			functions: 90,
			lines: 92,
			statements: 93,
		},
	},
};
