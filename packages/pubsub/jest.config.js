module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 16,
			functions: 41,
			lines: 28,
			statements: 28,
		},
	},
};
