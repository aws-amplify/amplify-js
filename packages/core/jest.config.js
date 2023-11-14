module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 78,
			lines: 88,
			statements: 88,
		},
	},
};
