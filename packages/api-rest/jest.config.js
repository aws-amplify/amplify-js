module.exports = {
	...require('../../jest.config'),
	coverageThreshold: {
		global: {
			branches: 82,
			functions: 89,
			lines: 94,
			statements: 95,
		},
	},
};
